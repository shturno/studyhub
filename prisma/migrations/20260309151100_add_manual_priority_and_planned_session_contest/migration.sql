-- AlterTable: add manualPriority to contests
ALTER TABLE "contests" ADD COLUMN "manualPriority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: add contestId to planned_sessions
ALTER TABLE "planned_sessions" ADD COLUMN "contestId" TEXT;

-- CreateIndex: index for contestId on planned_sessions
CREATE INDEX "planned_sessions_contestId_idx" ON "planned_sessions"("contestId");

-- AddForeignKey: planned_sessions.contestId -> contests.id
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_contestId_fkey"
  FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
