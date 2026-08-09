BEGIN;

CREATE TABLE IF NOT EXISTS "subscription" (
  "user_id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "plan" TEXT NOT NULL DEFAULT 'free' CHECK ("plan" IN ('free', 'plus', 'pro')),
  "billing_interval" TEXT CHECK ("billing_interval" IN ('monthly', 'annual')),
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "stripe_price_id" TEXT,
  "subscription_status" TEXT NOT NULL DEFAULT 'free',
  "current_period_start" TIMESTAMPTZ,
  "current_period_end" TIMESTAMPTZ,
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT FALSE,
  "has_had_paid_plan" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_payment_failed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_stripe_customer_id_idx"
  ON "subscription" ("stripe_customer_id") WHERE "stripe_customer_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_stripe_subscription_id_idx"
  ON "subscription" ("stripe_subscription_id") WHERE "stripe_subscription_id" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "review_run" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "manuscript_title" TEXT NOT NULL,
  "plan_at_run" TEXT NOT NULL CHECK ("plan_at_run" IN ('free', 'plus', 'pro')),
  "status" TEXT NOT NULL CHECK ("status" IN ('pending', 'running', 'completed', 'failed')),
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMPTZ,
  "quota_period_start" TIMESTAMPTZ,
  "provider" TEXT,
  "model" TEXT,
  "input_tokens" BIGINT,
  "output_tokens" BIGINT,
  "estimated_cost_gbp" NUMERIC(12, 6),
  "failure_code" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "review_run_user_status_idx"
  ON "review_run" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "review_run_user_quota_period_idx"
  ON "review_run" ("user_id", "quota_period_start", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "review_run_one_active_per_user_idx"
  ON "review_run" ("user_id") WHERE "status" IN ('pending', 'running');

CREATE TABLE IF NOT EXISTS "stripe_webhook_event" (
  "event_id" TEXT PRIMARY KEY,
  "event_type" TEXT NOT NULL,
  "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
