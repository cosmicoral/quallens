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
  status: "pending" | "running" | "completed" | "failed";
  planAtRun: Plan;
  startedAt: Date;
  completedAt: Date | null;
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
  return getUserEntitlement({ subscription, ...usage, now });
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
  manuscriptTitle: string,
  now = new Date(),
): Promise<ReviewReservation> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId]);
    await client.query(
      `UPDATE "review_run"
       SET "status" = 'failed', "failure_code" = 'stale_reservation',
           "completed_at" = $2, "updated_at" = $2
       WHERE "user_id" = $1 AND "status" IN ('pending', 'running')
         AND "started_at" < $2 - INTERVAL '2 hours'`,
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
      throw new BillingError(code, "Your current Qualisapio review allowance has been used.");
    }

    const id = randomUUID();
    await client.query(
      `INSERT INTO "review_run"
         ("id", "user_id", "manuscript_title", "plan_at_run", "status",
          "started_at", "quota_period_start", "provider", "model")
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)`,
      [
        id,
        userId,
        manuscriptTitle,
        entitlement.plan,
        now,
        entitlement.quotaPeriodStart,
        process.env.LLM_PROVIDER ?? "anthropic",
        process.env.LLM_MODEL ?? null,
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

export async function markReviewRunRunning(id: string) {
  await getDatabase().query(
    `UPDATE "review_run" SET "status" = 'running', "updated_at" = CURRENT_TIMESTAMP
     WHERE "id" = $1 AND "status" = 'pending'`,
    [id],
  );
}

export async function markReviewRunCompleted(id: string, completedAt = new Date()) {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "status" = 'completed', "completed_at" = $2, "updated_at" = $2
     WHERE "id" = $1 AND "status" IN ('pending', 'running')`,
    [id, completedAt],
  );
}

export async function markReviewRunFailed(
  id: string,
  failureCode: string,
  completedAt = new Date(),
) {
  await getDatabase().query(
    `UPDATE "review_run"
     SET "status" = 'failed', "failure_code" = $2,
         "completed_at" = $3, "updated_at" = $3
     WHERE "id" = $1 AND "status" IN ('pending', 'running')`,
    [id, failureCode, completedAt],
  );
}

export async function listRecentReviewRuns(userId: string, limit = 5): Promise<RecentReviewRun[]> {
  const result = await getDatabase().query<{
    id: string;
    manuscript_title: string;
    status: RecentReviewRun["status"];
    plan_at_run: Plan;
    started_at: Date;
    completed_at: Date | null;
  }>(
    `SELECT "id", "manuscript_title", "status", "plan_at_run", "started_at", "completed_at"
     FROM "review_run" WHERE "user_id" = $1
     ORDER BY "started_at" DESC LIMIT $2`,
    [userId, Math.max(1, Math.min(limit, 20))],
  );
  return result.rows.map((row) => ({
    id: row.id,
    manuscriptTitle: row.manuscript_title,
    status: row.status,
    planAtRun: row.plan_at_run,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
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
