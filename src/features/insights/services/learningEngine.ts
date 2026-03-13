import { prisma } from "@/lib/prisma";
import type { SessionLearningInput } from "../types";

/** Sessions shorter than this are counted as abandoned */
const ABANDON_THRESHOLD_MINUTES = 5;

/** EMA alpha for topicsPerWeek rolling average */
const EMA_ALPHA = 0.3;

// ─── Topic Stats ──────────────────────────────────────────────────────────────

/**
 * Incremental upsert of TopicLearningStats for a single session.
 * O(1) — no historical re-aggregation.
 */
export async function updateTopicStats(input: SessionLearningInput): Promise<void> {
  const { userId, topicId, minutes, difficulty, startedAt } = input;

  const existing = await prisma.topicLearningStats.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });

  if (!existing) {
    await prisma.topicLearningStats.create({
      data: {
        userId,
        topicId,
        totalMinutes: minutes,
        sessionCount: 1,
        difficultySumFloat: difficulty ?? 0,
        abandonCount: minutes < ABANDON_THRESHOLD_MINUTES ? 1 : 0,
        lastStudiedAt: startedAt,
      },
    });
    return;
  }

  await prisma.topicLearningStats.update({
    where: { userId_topicId: { userId, topicId } },
    data: {
      totalMinutes: { increment: minutes },
      sessionCount: { increment: 1 },
      difficultySumFloat: { increment: difficulty ?? 0 },
      abandonCount: minutes < ABANDON_THRESHOLD_MINUTES
        ? { increment: 1 }
        : undefined,
      lastStudiedAt: startedAt > (existing.lastStudiedAt ?? new Date(0))
        ? startedAt
        : undefined,
    },
  });
}

// ─── User Learning Profile ────────────────────────────────────────────────────

/**
 * Incremental upsert of UserLearningProfile.
 * Updates hourly/daily distributions, recalculates peak slots
 * and rolling averages.
 */
export async function updateUserProfile(input: SessionLearningInput): Promise<void> {
  const { userId, minutes, startedAt } = input;

  const hour = startedAt.getHours(); // 0-23
  const dow = startedAt.getDay(); // 0 (Sun) – 6 (Sat)

  const existing = await prisma.userLearningProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    const hourly = new Array(24).fill(0) as number[];
    const daily = new Array(7).fill(0) as number[];
    hourly[hour] += minutes;
    daily[dow] += minutes;

    await prisma.userLearningProfile.create({
      data: {
        userId,
        hourlyDistribution: hourly,
        dailyDistribution: daily,
        peakHourOfDay: hour,
        peakDayOfWeek: dow,
        avgSessionMinutes: minutes,
        topicsPerWeek: 1,
        lastComputedAt: new Date(),
      },
    });
    return;
  }

  // Update distributions
  const hourly = existing.hourlyDistribution as number[];
  const daily = existing.dailyDistribution as number[];
  hourly[hour] = (hourly[hour] ?? 0) + minutes;
  daily[dow] = (daily[dow] ?? 0) + minutes;

  // Recalculate peaks
  const peakHourOfDay = hourly.indexOf(Math.max(...hourly));
  const peakDayOfWeek = daily.indexOf(Math.max(...daily));

  // Update avgSessionMinutes (cumulative moving average)
  const n = await prisma.studySession.count({ where: { userId } });
  const newAvg = n > 1
    ? (existing.avgSessionMinutes * (n - 1) + minutes) / n
    : minutes;

  // Update topicsPerWeek (EMA — how many distinct topics studied per 7-day window)
  const sevenDaysAgo = new Date(startedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentTopicCount = await prisma.studySession.findMany({
    where: { userId, startedAt: { gte: sevenDaysAgo } },
    select: { topicId: true },
    distinct: ["topicId"],
  });
  const currentWeekTopics = recentTopicCount.length;
  const newTopicsPerWeek = existing.topicsPerWeek === 0
    ? currentWeekTopics
    : EMA_ALPHA * currentWeekTopics + (1 - EMA_ALPHA) * existing.topicsPerWeek;

  await prisma.userLearningProfile.update({
    where: { userId },
    data: {
      hourlyDistribution: hourly,
      dailyDistribution: daily,
      peakHourOfDay,
      peakDayOfWeek,
      avgSessionMinutes: newAvg,
      topicsPerWeek: newTopicsPerWeek,
      lastComputedAt: new Date(),
    },
  });
}

// ─── Subject Correlations ─────────────────────────────────────────────────────

/**
 * For a given session's subject, find all OTHER subjects the user studied
 * on the same calendar day and increment their co-study scores.
 * Pairs are stored with subjectAId < subjectBId to avoid duplicates.
 */
export async function updateSubjectCorrelations(input: SessionLearningInput): Promise<void> {
  const { userId, subjectId, startedAt } = input;

  const dayStart = new Date(startedAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(startedAt);
  dayEnd.setHours(23, 59, 59, 999);

  // Other subjects studied today (excluding the current one)
  const todaySessions = await prisma.studySession.findMany({
    where: {
      userId,
      startedAt: { gte: dayStart, lte: dayEnd },
      topic: { subjectId: { not: subjectId } },
    },
    select: { topic: { select: { subjectId: true } } },
    distinct: ["topicId"],
  });

  const otherSubjectIds = [
    ...new Set(todaySessions.map((s) => s.topic.subjectId)),
  ];

  if (otherSubjectIds.length === 0) return;

  // Upsert each pair — always store with a < b to ensure uniqueness
  for (const otherSubjectId of otherSubjectIds) {
    const [a, b] = [subjectId, otherSubjectId].sort();

    await prisma.subjectCorrelation.upsert({
      where: {
        userId_subjectAId_subjectBId: {
          userId,
          subjectAId: a,
          subjectBId: b,
        },
      },
      create: { userId, subjectAId: a, subjectBId: b, coStudyCount: 1 },
      update: { coStudyCount: { increment: 1 } },
    });
  }
}

// ─── Composite entry point ────────────────────────────────────────────────────

/**
 * Run all three learning engine updates in parallel.
 * Errors are swallowed — the learning engine must NEVER break session saves.
 */
export async function runLearningEngine(input: SessionLearningInput): Promise<void> {
  try {
    await Promise.all([
      updateTopicStats(input),
      updateUserProfile(input),
      updateSubjectCorrelations(input),
    ]);
  } catch (err) {
    console.error("[LearningEngine] Background update failed:", err);
  }
}
