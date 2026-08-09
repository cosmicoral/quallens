BEGIN;

ALTER TABLE "review_run"
  ADD COLUMN IF NOT EXISTS "result_payload" JSONB;

COMMIT;
