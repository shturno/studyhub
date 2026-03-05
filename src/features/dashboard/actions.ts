"use server";

import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { ok, err, type ActionResult } from "@/lib/result";
import { calculateLevel } from "@/features/gamification/utils/xpCalculator";
import { getStudyRecommendations } from "@/features/ai/services/aiAdvisoryService";
import type { DashboardData } from "./types";

export async function getDashboardData(
  userId: string,
): Promise<ActionResult<DashboardData>> {
  try {
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
      return err("Usuário não encontrado");
    }

    const effectiveLevel = calculateLevel(user.xp);

    // Buscar concurso primário com tópicos para calcular cobertura
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

    const allTopics =
      contestWithTopics?.subjects.flatMap((s) => s.topics) ?? [];
    const totalTopics = allTopics.length;
    const studiedCount = allTopics.filter(
      (t) => t.studySessions.length > 0,
    ).length;
    const coveragePercent =
      totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

    // Tópicos não estudados como priorities para o Gemini
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

    const [weeklySessions, recentSessions, aiRecommendations] =
      await Promise.all([
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
          "Foque nos tópicos com maior peso no edital",
          "Pratique com questões de provas anteriores",
          "Revise os tópicos estudados na última semana",
        ]),
      ]);

    const weeklyStats = {
      minutesStudied: weeklySessions.reduce(
        (sum: number, s) => sum + s.minutes,
        0,
      ),
      sessionsCompleted: weeklySessions.length,
      xpEarned: weeklySessions.reduce((sum: number, s) => sum + s.xpEarned, 0),
    };

    return ok({
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
    });
  } catch {
    return err("Erro ao carregar dados do dashboard");
  }
}
