BEGIN;

ALTER TABLE "review_run"
  ADD COLUMN IF NOT EXISTS "target_journal" TEXT;

COMMIT;
