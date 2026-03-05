import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { getTranslations } from "next-intl/server";
import { calculateLevel } from "@/features/gamification/utils/xpCalculator";
import { getStudyRecommendations } from "@/features/ai/services/aiAdvisoryService";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(userId: string, _contestId?: string): Promise<DashboardData> {
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

  const contestWithTopics = await prisma.contest.findFirst({
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

  const allTopics = contestWithTopics?.subjects.flatMap((s) => s.topics) ?? [];
  const totalTopics = allTopics.length;
  const studiedCount = allTopics.filter((t) => t.studySessions.length > 0).length;
  const coveragePercent = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

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

  const activeCycle = await prisma.studyCycle.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  let nextTopic = null;
  if (activeCycle) {
    const config = activeCycle.config as { topicIds: string[] };
    const topicIds = config.topicIds || [];

    if (topicIds.length > 0) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicIds[0] },
        include: {
          subject: {
            select: {
              name: true,
            },
          },
        },
      });

      if (topic) {
        nextTopic = {
          id: topic.id,
          name: topic.name,
          subjectName: topic.subject.name,
          estimatedMinutes: 25,
        };
      }
    }
  }

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const [weeklySessions, recentSessions, aiRecommendations] = await Promise.all([
    prisma.studySession.findMany({
      where: {
        userId,
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    }),
    prisma.studySession.findMany({
      where: { userId },
      take: 5,
      orderBy: { completedAt: "desc" },
      include: { topic: { select: { name: true } } },
    }),
    getStudyRecommendations(
      contestWithTopics?.name ?? "concurso",
      priorities,
      coveragePercent,
    ).catch(() => [
      t("fallback1"),
      t("fallback2"),
      t("fallback3"),
    ]),
  ]);

  const weeklyStats = {
    minutesStudied: weeklySessions.reduce((sum: number, s) => sum + s.minutes, 0),
    sessionsCompleted: weeklySessions.length,
    xpEarned: weeklySessions.reduce((sum: number, s) => sum + s.xpEarned, 0),
  };

  return {
    user: { ...user, name: user.name ?? "", level: effectiveLevel },
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
  };
}
