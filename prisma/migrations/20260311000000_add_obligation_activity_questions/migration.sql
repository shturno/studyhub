-- AlterTable
ALTER TABLE "contests" ADD COLUMN "banca" TEXT;

-- AlterTable
ALTER TABLE "daily_missions" ADD COLUMN "isCore" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "daily_obligations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contestId" TEXT,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "xpPenalty" INTEGER NOT NULL DEFAULT 25,
    "penaltyApplied" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_questions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contestId" TEXT,
    "statement" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contestId" TEXT,
    "total" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'GEMINI',
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_obligations_userId_idx" ON "daily_obligations"("userId");

-- CreateIndex
CREATE INDEX "daily_obligations_topicId_idx" ON "daily_obligations"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_obligations_userId_date_key" ON "daily_obligations"("userId", "date");

-- CreateIndex
CREATE INDEX "activity_events_userId_createdAt_idx" ON "activity_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "generated_questions_userId_topicId_idx" ON "generated_questions"("userId", "topicId");

-- CreateIndex
CREATE INDEX "generated_questions_userId_topicId_usedAt_idx" ON "generated_questions"("userId", "topicId", "usedAt");

-- CreateIndex
CREATE INDEX "question_logs_userId_idx" ON "question_logs"("userId");

-- CreateIndex
CREATE INDEX "question_logs_topicId_idx" ON "question_logs"("topicId");

-- AddForeignKey
ALTER TABLE "daily_obligations" ADD CONSTRAINT "daily_obligations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_obligations" ADD CONSTRAINT "daily_obligations_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_obligations" ADD CONSTRAINT "daily_obligations_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_questions" ADD CONSTRAINT "generated_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_questions" ADD CONSTRAINT "generated_questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_questions" ADD CONSTRAINT "generated_questions_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_logs" ADD CONSTRAINT "question_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_logs" ADD CONSTRAINT "question_logs_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
