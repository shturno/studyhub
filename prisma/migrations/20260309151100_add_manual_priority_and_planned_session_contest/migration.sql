-- AlterTable: add manualPriority to contests
ALTER TABLE "contests" ADD COLUMN "manualPriority" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: planned_sessions (with contestId already included)
CREATE TABLE "planned_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contestId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planned_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "planned_sessions_userId_idx" ON "planned_sessions"("userId");

-- CreateIndex
CREATE INDEX "planned_sessions_scheduledDate_idx" ON "planned_sessions"("scheduledDate");

-- CreateIndex
CREATE INDEX "planned_sessions_contestId_idx" ON "planned_sessions"("contestId");

-- AddForeignKey
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_topicId_fkey"
  FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_sessions" ADD CONSTRAINT "planned_sessions_contestId_fkey"
  FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
