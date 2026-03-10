import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, subWeeks } from "date-fns";
import { calculateLevel, getLevelProgress, getXPForNextLevel } from "@/features/gamification/utils/xpCalculator";
import type { DashboardData, WeeklyData, TrackData } from "@/features/dashboard/types";

export async function getDashboardData(
  userId: string,
  contestId?: string,
): Promise<DashboardData> {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const [
    user,
    contestWithTopics,
    heatmapRaw,
    weeklyAgg,
    todayAgg,
    recentSessions,
    weeklyChartRaw,
    trackRaw,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, xp: true, level: true, streakDays: true, lastStudyDate: true, settings: true },
    }),

    contestId
      ? prisma.contest.findUnique({
          where: { id: contestId, userId },
          include: {
            subjects: {
              include: {
                topics: {
                  include: {
                    studySessions: { where: { userId }, take: 1, select: { id: true } },
                  },
                },
              },
            },
          },
        })
      : prisma.contest.findFirst({
          where: { userId },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          include: {
            subjects: {
              include: {
                topics: {
                  include: {
                    studySessions: { where: { userId }, take: 1, select: { id: true } },
                  },
                },
              },
            },
          },
        }),

    prisma.$queryRaw<Array<{ date: string; count: number; minutes: number }>>`
      SELECT
        TO_CHAR("completedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(*)::int                                            AS count,
        SUM(minutes)::int                                        AS minutes
      FROM study_sessions
      WHERE "userId" = ${userId}
        AND "completedAt" >= ${since}
      GROUP BY TO_CHAR("completedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    `,

    prisma.studySession.aggregate({
      where: { userId, completedAt: { gte: weekStart, lte: weekEnd } },
      _sum: { minutes: true, xpEarned: true },
      _count: { id: true },
    }),

    prisma.studySession.aggregate({
      where: { userId, completedAt: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } },
      _sum: { minutes: true },
    }),

    prisma.studySession.findMany({
      where: { userId },
      select: {
        id: true,
        completedAt: true,
        minutes: true,
        xpEarned: true,
        topic: { select: { name: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),

    prisma.$queryRaw<Array<{ week_start: Date; minutes: number }>>`
      SELECT
        DATE_TRUNC('week', "completedAt" AT TIME ZONE 'UTC') AS week_start,
        SUM(minutes)::int                                     AS minutes
      FROM study_sessions
      WHERE "userId" = ${userId}
        AND "completedAt" >= ${subWeeks(new Date(), 8)}
      GROUP BY DATE_TRUNC('week', "completedAt" AT TIME ZONE 'UTC')
      ORDER BY week_start ASC
    `,

    prisma.$queryRaw<Array<{ name: string; minutes: number }>>`
      SELECT
        t.name,
        SUM(s.minutes)::int AS minutes
      FROM study_sessions s
      JOIN topics t ON s."topicId" = t.id
      WHERE s."userId" = ${userId}
        AND s."completedAt" >= ${since}
      GROUP BY t.name
      ORDER BY minutes DESC
      LIMIT 20
    `,
  ]);

  if (!user) throw new Error("User not found");

  const userSettings =
    typeof user.settings === "object" && user.settings !== null
      ? (user.settings as Record<string, unknown>)
      : {};
  const dailyGoalMinutes = Number(userSettings.dailyGoalMinutes) || 120;
  const studiedTodayMinutes = todayAgg._sum.minutes ?? 0;

  const effectiveLevel = calculateLevel(user.xp);

  const allTopics =
    contestWithTopics?.subjects.flatMap((s) =>
      s.topics.map((topic) => ({ ...topic, subjectName: s.name })),
    ) ?? [];
  const totalTopics = allTopics.length;
  const studiedCount = allTopics.filter((t) => t.studySessions.length > 0).length;
  const coveragePercent =
    totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

  const priorities = allTopics
    .filter((t) => t.studySessions.length === 0)
    .slice(0, 10)
    .map((t) => ({
      topicId: t.id,
      topicName: t.name,
      priority: "high" as const,
      reason: "Não estudado ainda",
      recommendedHours: 2,
    }));

  const unstudiedTopic = allTopics.find((t) => t.studySessions.length === 0);
  const nextTopic = unstudiedTopic
    ? {
        id: unstudiedTopic.id,
        name: unstudiedTopic.name,
        subjectName: unstudiedTopic.subjectName,
        estimatedMinutes: 25,
      }
    : null;

  const heatmap = heatmapRaw.map((r) => ({
    date: r.date,
    count: Number(r.count),
    minutes: Number(r.minutes),
  }));

  const weeklyStats = {
    minutesStudied: weeklyAgg._sum.minutes ?? 0,
    sessionsCompleted: weeklyAgg._count.id,
    xpEarned: weeklyAgg._sum.xpEarned ?? 0,
  };

  const weeklyChartMap = new Map(
    weeklyChartRaw.map((r) => [
      startOfWeek(new Date(r.week_start)).toISOString(),
      Number(r.minutes),
    ]),
  );

  const weeklyStatsData: WeeklyData[] = Array.from({ length: 8 }, (_, i) => {
    const wStart = startOfWeek(subWeeks(new Date(), 7 - i));
    const minutes = weeklyChartMap.get(wStart.toISOString()) ?? 0;
    return { week: format(wStart, "dd/MM"), hours: Math.round(minutes / 60) };
  });

  const trackDistribution: TrackData[] = trackRaw.map((r) => ({
    name: r.name,
    minutes: Number(r.minutes),
    hours: Math.round(Number(r.minutes) / 60),
  }));

  return {
    user: { ...user, name: user.name ?? "", level: effectiveLevel },
    statsData: { weeklyStats: weeklyStatsData, trackDistribution },
    nextTopic,
    weeklyStats,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      topicName: s.topic.name,
      minutes: s.minutes,
      xpEarned: s.xpEarned,
      completedAt: s.completedAt,
    })),
    coveragePercent,
    contestName: contestWithTopics?.name ?? "concurso",
    priorities,
    heatmap,
    streak: user.streakDays,
    xpProgress: getLevelProgress(user.xp, effectiveLevel),
    xpToNextLevel: getXPForNextLevel(user.xp, effectiveLevel),
    dailyGoal: {
      targetMinutes: dailyGoalMinutes,
      studiedTodayMinutes,
    },
  };
}
