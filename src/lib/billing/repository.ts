import "server-only";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getDatabase } from "@/lib/auth/db";
import { BillingError } from "./errors";
import {
  getUtcMonthlyQuotaPeriod,
  getUserEntitlement,
  toUsageView,
  type SubscriptionState,
  type UsageView,
  type UserEntitlement,
} from "./entitlement";
import type { BillingInterval, Plan } from "./config";
import type { ManuscriptInput, ReviewResult } from "@/lib/types";
import { decryptManuscript, encryptManuscript } from "@/lib/review/input-crypto";
import { hasUnlimitedReviewAccess } from "./unlimited-access";

interface SubscriptionRow {
  user_id: string;
  plan: Plan;
  billing_interval: BillingInterval | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  has_had_paid_plan: boolean;
  last_payment_failed_at: Date | null;
}

export interface BillingRecord extends SubscriptionState {
  userId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  lastPaymentFailedAt: Date | null;
}

export interface ReviewReservation {
  id: string;
  entitlement: UserEntitlement;
}

export interface RecentReviewRun {
  id: string;
  manuscriptTitle: string;
  targetJournal: string | null;
  status: "pending" | "running" | "completed" | "failed";
  planAtRun: Plan;
  startedAt: Date;
  completedAt: Date | null;
  hasStoredResult: boolean;
  progressStage: string | null;
  failureCode: string | null;
  failureDetail: string | null;
}

export interface StoredReviewRun extends RecentReviewRun {
  result: ReviewResult | null;
}

export interface ReviewJobRecord {
  id: string;
  userId: string;
  status: RecentReviewRun["status"];
  manuscript: ManuscriptInput | null;
}

function mapBillingRecord(row: SubscriptionRow): BillingRecord {
  return {
    userId: row.user_id,
    plan: row.plan,
    billingInterval: row.billing_interval,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    subscriptionStatus: row.subscription_status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    hasHadPaidPlan: row.has_had_paid_plan,
    lastPaymentFailedAt: row.last_payment_failed_at,
  };
}

async function ensureSubscription(client: PoolClient, userId: string) {
  await client.query(
    `INSERT INTO "subscription" ("user_id") VALUES ($1)
     ON CONFLICT ("user_id") DO NOTHING`,
    [userId],
  );
}

async function getBillingRecordWithClient(
  client: PoolClient,
  userId: string,
  lock = false,
): Promise<BillingRecord> {
  await ensureSubscription(client, userId);
  const result = await client.query<SubscriptionRow>(
    `SELECT "user_id", "plan", "billing_interval", "stripe_customer_id",
            "stripe_subscription_id", "stripe_price_id", "subscription_status",
            "current_period_start", "current_period_end", "cancel_at_period_end",
            "has_had_paid_plan", "last_payment_failed_at"
     FROM "subscription" WHERE "user_id" = $1${lock ? " FOR UPDATE" : ""}`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Subscription state could not be created.");
  return mapBillingRecord(row);
}

export async function getBillingRecord(userId: string): Promise<BillingRecord> {
  const client = await getDatabase().connect();
  try {
    return await getBillingRecordWithClient(client, userId);
  } finally {
    client.release();
  }
}

async function countUsage(client: PoolClient, userId: string, now: Date) {
  const period = getUtcMonthlyQuotaPeriod(now);
  const result = await client.query<{
    completed_free: string;
    completed_paid: string;
    active_reservations: string;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE "status" = 'completed' AND "plan_at_run" = 'free') AS "completed_free",
       COUNT(*) FILTER (
         WHERE "status" = 'completed'
           AND "plan_at_run" IN ('plus', 'pro')
           AND "started_at" >= $2 AND "started_at" < $3
       ) AS "completed_paid",
       COUNT(*) FILTER (WHERE "status" IN ('pending', 'running')) AS "active_reservations"
     FROM "review_run" WHERE "user_id" = $1`,
    [userId, period.start, period.end],
  );
  const row = result.rows[0];
  return {
    completedFreeReviews: Number(row?.completed_free ?? 0),
    completedPaidReviewsInPeriod: Number(row?.completed_paid ?? 0),
    activeReservations: Number(row?.active_reservations ?? 0),
  };
}

async function getEntitlementWithClient(
  client: PoolClient,
  userId: string,
  now: Date,
  lock = false,
) {
  const subscription = await getBillingRecordWithClient(client, userId, lock);
  const usage = await countUsage(client, userId, now);
  const identityResult = await client.query<{
    email: string | null;
    email_verified: boolean;
  }>(
    `SELECT "email", "emailVerified" AS "email_verified" FROM "user" WHERE "id" = $1`,
    [userId],
  );
  const identity = identityResult.rows[0];
  return getUserEntitlement({
    subscription,
    ...usage,
    unlimited: hasUnlimitedReviewAccess({
      userId,
      email: identity?.email,
      emailVerified: identity?.email_verified,
    }),
    now,
  });
}

export async function getUsageView(userId: string, now = new Date()): Promise<UsageView> {
  const client = await getDatabase().connect();
  try {
    return toUsageView(await getEntitlementWithClient(client, userId, now));
  } finally {
    client.release();
  }
}

export async function reserveReviewRun(
  userId: string,
  manuscript: ManuscriptInput,
  now = new Date(),
): Promise<ReviewReservation> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId]);
    await client.query(
      `UPDATE "review_run"
       SET "status" = 'failed', "failure_code" = 'stale_reservation',
           "failure_detail" = 'The saved review expired before it could be completed.',
           "input_payload" = NULL, "progress_stage" = 'failed',
           "completed_at" = $2, "updated_at" = $2
       WHERE "user_id" = $1 AND "status" IN ('pending', 'running')
         -- The cast is required: PostgreSQL otherwise resolves the unknown
         -- parameter in the timestamp subtraction as an interval, not a timestamp.
         AND "updated_at" < $2::timestamptz - INTERVAL '2 hours'`,
      [userId, now],
    );

    const entitlement = await getEntitlementWithClient(client, userId, now, true);
    if (entitlement.reserved > 0) {
      throw new BillingError("active_review", "A review is already in progress for this account.");
    }
    if (!entitlement.canReview) {
      const code = entitlement.reason === "free_trial_used"
        ? "free_trial_used"
        : entitlement.reason === "former_paid_user"
          ? "former_paid_user"
          : "quota_exhausted";
      throw new BillingError(code, "Your current QualiSapio review allowance has been used.");
    }

    const id = randomUUID();
    await client.query(
      `INSERT INTO "review_run"
         ("id", "user_id", "manuscript_title", "target_journal", "plan_at_run", "status",
          "started_at", "quota_period_start", "provider", "model", "input_payload", "progress_stage")
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, 'queued')`,
      [
        id,
        userId,
        manuscript.title,
        manuscript.targetJournal?.trim() || null,
        entitlement.plan,
        now,
        entitlement.quotaPeriodStart,
        process.env.LLM_PROVIDER ?? "anthropic",
        process.env.LLM_MODEL ?? null,
        JSON.stringify(encryptManuscript(manuscript)),
      ],
    );
    await client.query("COMMIT");
    return { id, entitlement };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function markReviewRunRunning(id: string, stage = "manuscript-reader") {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "status" = 'running', "progress_stage" = $2, "updated_at" = CURRENT_TIMESTAMP
     WHERE "id" = $1 AND "status" IN ('pending', 'running')`,
    [id, stage],
  );
}

export async function markReviewRunProgress(id: string, stage: string) {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "progress_stage" = $2, "updated_at" = CURRENT_TIMESTAMP
     WHERE "id" = $1 AND "status" = 'running'`,
    [id, stage],
  );
}

export async function markReviewRunCompleted(
  id: string,
  result?: ReviewResult,
  completedAt = new Date(),
) {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "status" = 'completed',
         "completed_at" = $2,
         "result_payload" = $3,
         "input_payload" = NULL,
         "progress_stage" = 'completed',
         "failure_code" = NULL,
         "failure_detail" = NULL,
         "updated_at" = $2
     WHERE "id" = $1 AND "status" IN ('pending', 'running')`,
    [id, completedAt, result ? JSON.stringify(result) : null],
  );
}

export async function markReviewRunFailed(
  id: string,
  failureCode: string,
  completedAt = new Date(),
  failureDetail?: string,
) {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "status" = 'failed', "failure_code" = $2,
         "failure_detail" = $4, "input_payload" = NULL,
         "progress_stage" = 'failed', "completed_at" = $3, "updated_at" = $3
     WHERE "id" = $1 AND "status" IN ('pending', 'running')`,
    [id, failureCode, completedAt, failureDetail?.slice(0, 2000) ?? null],
  );
}

export async function getReviewJob(runId: string): Promise<ReviewJobRecord | null> {
  const result = await getDatabase().query<{
    id: string;
    user_id: string;
    status: RecentReviewRun["status"];
    input_payload: unknown | null;
  }>(
    `SELECT "id", "user_id", "status", "input_payload"
     FROM "review_run" WHERE "id" = $1`,
    [runId],
  );
  const row = result.rows[0];
  return row
    ? {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        manuscript: row.input_payload ? decryptManuscript(row.input_payload) : null,
      }
    : null;
}

/** Hold a database-backed lock so only one Render process can execute a job. */
export async function withReviewRunLock(
  runId: string,
  work: () => Promise<void>,
): Promise<boolean> {
  const client = await getDatabase().connect();
  let locked = false;
  try {
    const lock = await client.query<{ acquired: boolean }>(
      `SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS "acquired"`,
      [runId],
    );
    locked = Boolean(lock.rows[0]?.acquired);
    if (!locked) return false;
    await work();
    return true;
  } finally {
    if (locked) {
      await client.query(
        `SELECT pg_advisory_unlock(hashtextextended($1, 0))`,
        [runId],
      ).catch(() => {});
    }
    client.release();
  }
}

export async function listRecentReviewRuns(userId: string, limit = 10): Promise<RecentReviewRun[]> {
  const result = await getDatabase().query<{
    id: string;
    manuscript_title: string;
    target_journal: string | null;
    status: RecentReviewRun["status"];
    plan_at_run: Plan;
    started_at: Date;
    completed_at: Date | null;
    has_stored_result: boolean;
    progress_stage: string | null;
    failure_code: string | null;
    failure_detail: string | null;
  }>(
    `SELECT "id", "manuscript_title", "target_journal", "status", "plan_at_run", "started_at", "completed_at",
            ("result_payload" IS NOT NULL) AS "has_stored_result", "progress_stage", "failure_code", "failure_detail"
     FROM "review_run" WHERE "user_id" = $1
     ORDER BY "started_at" DESC LIMIT $2`,
    [userId, Math.max(1, Math.min(limit, 20))],
  );
  return result.rows.map((row) => ({
    id: row.id,
    manuscriptTitle: row.manuscript_title,
    targetJournal: row.target_journal,
    status: row.status,
    planAtRun: row.plan_at_run,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    hasStoredResult: row.has_stored_result,
    progressStage: row.progress_stage,
    failureCode: row.failure_code,
    failureDetail: row.failure_detail,
  }));
}

export async function getReviewRunForUser(
  userId: string,
  runId: string,
): Promise<StoredReviewRun | null> {
  const result = await getDatabase().query<{
    id: string;
    manuscript_title: string;
    target_journal: string | null;
    status: RecentReviewRun["status"];
    plan_at_run: Plan;
    started_at: Date;
    completed_at: Date | null;
    result_payload: ReviewResult | null;
    progress_stage: string | null;
    failure_code: string | null;
    failure_detail: string | null;
  }>(
    `SELECT "id", "manuscript_title", "target_journal", "status", "plan_at_run", "started_at", "completed_at",
            "result_payload", "progress_stage", "failure_code", "failure_detail"
     FROM "review_run"
     WHERE "id" = $1 AND "user_id" = $2`,
    [runId, userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    manuscriptTitle: row.manuscript_title,
    targetJournal: row.target_journal,
    status: row.status,
    planAtRun: row.plan_at_run,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    hasStoredResult: row.result_payload != null,
    progressStage: row.progress_stage,
    failureCode: row.failure_code,
    failureDetail: row.failure_detail,
    result: row.result_payload,
  };
}

export async function setStripeCustomerId(userId: string, customerId: string) {
  await getDatabase().query(
    `INSERT INTO "subscription" ("user_id", "stripe_customer_id") VALUES ($1, $2)
     ON CONFLICT ("user_id") DO UPDATE
       SET "stripe_customer_id" = COALESCE("subscription"."stripe_customer_id", EXCLUDED."stripe_customer_id"),
           "updated_at" = CURRENT_TIMESTAMP`,
    [userId, customerId],
  );
}

export async function replaceStripeCustomerId(userId: string, customerId: string) {
  await getDatabase().query(
    `UPDATE "subscription"
     SET "stripe_customer_id" = $2, "updated_at" = CURRENT_TIMESTAMP
     WHERE "user_id" = $1`,
    [userId, customerId],
  );
}
