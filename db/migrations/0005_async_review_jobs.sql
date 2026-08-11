BEGIN;

ALTER TABLE "review_run"
  ADD COLUMN IF NOT EXISTS "input_payload" JSONB,
  ADD COLUMN IF NOT EXISTS "progress_stage" TEXT,
  ADD COLUMN IF NOT EXISTS "failure_detail" TEXT;

COMMIT;
