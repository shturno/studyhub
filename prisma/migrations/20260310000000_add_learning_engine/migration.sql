-- CreateTable: Adaptive Learning Engine
-- Applied via `prisma db push` (migration drift resolved)

CREATE TABLE "topic_learning_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "difficultySumFloat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "abandonCount" INTEGER NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_learning_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_learning_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hourlyDistribution" JSONB NOT NULL DEFAULT '[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]',
    "peakHourOfDay" INTEGER,
    "peakDayOfWeek" INTEGER,
    "dailyDistribution" JSONB NOT NULL DEFAULT '[0,0,0,0,0,0,0]',
    "avgSessionMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "topicsPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_learning_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subject_correlations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectAId" TEXT NOT NULL,
    "subjectBId" TEXT NOT NULL,
    "coStudyCount" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_learning_stats_userId_topicId_key" ON "topic_learning_stats"("userId", "topicId");
CREATE INDEX "topic_learning_stats_userId_idx" ON "topic_learning_stats"("userId");
CREATE INDEX "topic_learning_stats_topicId_idx" ON "topic_learning_stats"("topicId");

CREATE UNIQUE INDEX "user_learning_profiles_userId_key" ON "user_learning_profiles"("userId");

CREATE UNIQUE INDEX "subject_correlations_userId_subjectAId_subjectBId_key" ON "subject_correlations"("userId", "subjectAId", "subjectBId");
CREATE INDEX "subject_correlations_userId_idx" ON "subject_correlations"("userId");

-- AddForeignKey
ALTER TABLE "topic_learning_stats" ADD CONSTRAINT "topic_learning_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_learning_stats" ADD CONSTRAINT "topic_learning_stats_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_learning_profiles" ADD CONSTRAINT "user_learning_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subject_correlations" ADD CONSTRAINT "subject_correlations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subject_correlations" ADD CONSTRAINT "subject_correlations_subjectAId_fkey" FOREIGN KEY ("subjectAId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subject_correlations" ADD CONSTRAINT "subject_correlations_subjectBId_fkey" FOREIGN KEY ("subjectBId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
