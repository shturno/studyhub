import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, format, subWeeks, startOfDay } from "date-fns";
import { getTranslations } from "next-intl/server";
import { calculateLevel } from "@/features/gamification/utils/xpCalculator";
import { getStudyRecommendations } from "@/features/ai/services/aiAdvisoryService";
import type { DashboardData, WeeklyData, TrackData } from "@/features/dashboard/types";

export async function getDashboardData(
  userId: string,
  contestId?: string,
): Promise<DashboardData> {
  const t = await getTranslations("AIAdvisoryCard");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const effectiveLevel = calculateLevel(user.xp);

  const contestWithTopics = contestId
    ? await prisma.contest.findUnique({
        where: { id: contestId, userId },
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  studySessions: {
                    where: { userId },
                    take: 1,
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      })
    : await prisma.contest.findFirst({
        where: { userId },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  studySessions: {
                    where: { userId },
                    take: 1,
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      });

  const allTopics =
    contestWithTopics?.subjects.flatMap((s) =>
      s.topics.map((topic) => ({ ...topic, subjectName: s.name })),
    ) ?? [];
  const totalTopics = allTopics.length;
  const studiedCount = allTopics.filter(
    (t) => t.studySessions.length > 0,
  ).length;
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

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const [allSessions, aiRecommendations] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, completedAt: { gte: since } },
      select: {
        id: true,
        completedAt: true,
        minutes: true,
        xpEarned: true,
        topic: { select: { name: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    getStudyRecommendations(
      contestWithTopics?.name ?? "concurso",
      priorities,
      coveragePercent,
    ).catch(() => [t("fallback1"), t("fallback2"), t("fallback3")]),
  ]);

  const heatmapMap = new Map<string, { count: number; minutes: number }>();
  let weekMinutes = 0;
  let weekSessions = 0;
  let weekXP = 0;

  for (const s of allSessions) {
    const key = s.completedAt.toISOString().slice(0, 10);
    const cur = heatmapMap.get(key) ?? { count: 0, minutes: 0 };
    heatmapMap.set(key, {
      count: cur.count + 1,
      minutes: cur.minutes + s.minutes,
    });

    if (s.completedAt >= weekStart && s.completedAt <= weekEnd) {
      weekMinutes += s.minutes;
      weekSessions += 1;
      weekXP += s.xpEarned;
    }
  }

  const heatmap = Array.from(heatmapMap.entries()).map(([date, v]) => ({
    date,
    ...v,
  }));

  const weeklyStats = {
    minutesStudied: weekMinutes,
    sessionsCompleted: weekSessions,
    xpEarned: weekXP,
  };

  const recentSessions = allSessions.slice(0, 5);

  const weeklyStatsData: WeeklyData[] = Array.from({ length: 8 }, (_, i) => {
    const weekAgo = subWeeks(new Date(), 7 - i);
    const wStart = startOfWeek(weekAgo);
    const wEnd = endOfWeek(weekAgo);
    const minutes = allSessions
      .filter((s) => s.completedAt >= wStart && s.completedAt <= wEnd)
      .reduce((sum, s) => sum + s.minutes, 0);
    return { week: format(wStart, "dd/MM"), hours: Math.round(minutes / 60) };
  });

  const trackMinutesMap = new Map<string, number>();
  for (const s of allSessions) {
    const name = s.topic.name;
    trackMinutesMap.set(name, (trackMinutesMap.get(name) ?? 0) + s.minutes);
  }
  const trackDistribution: TrackData[] = Array.from(
    trackMinutesMap.entries(),
  ).map(([name, minutes]) => ({
    name,
    minutes,
    hours: Math.round(minutes / 60),
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
    aiRecommendations,
    coveragePercent,
    heatmap,
  };
}
