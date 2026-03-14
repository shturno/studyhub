-- CreateTable: daily_missions
-- Uses IF NOT EXISTS so this migration is safe to run on databases that
-- already have the table (e.g. dev where it was created earlier via db push).
-- NOTE: isCore column is intentionally omitted here; it is added by the next
--       migration (20260311000000_add_obligation_activity_questions).

CREATE TABLE IF NOT EXISTS "daily_missions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpReward" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IF NOT EXISTS for idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS "daily_missions_userId_date_type_key" ON "daily_missions"("userId", "date", "type");

CREATE INDEX IF NOT EXISTS "daily_missions_userId_date_idx" ON "daily_missions"("userId", "date");

-- AddForeignKey (conditional to avoid duplicate constraint error)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_missions_userId_fkey'
  ) THEN
    ALTER TABLE "daily_missions"
      ADD CONSTRAINT "daily_missions_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
