"use server";

import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { ok, err, type ActionResult } from "@/lib/result";

export async function getDashboardData(
  userId: string,
): Promise<
  ActionResult<{
    user: { id: string; name: string; xp: number; level: number };
    nextTopic: {
      id: string;
      name: string;
      subjectName: string;
      estimatedMinutes: number;
    } | null;
    weeklyStats: {
      minutesStudied: number;
      sessionsCompleted: number;
      xpEarned: number;
    };
    recentSessions: Array<{
      id: string;
      topicName: string;
      minutes: number;
      xpEarned: number;
      completedAt: Date;
    }>;
  }>
> {
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

    const weeklySessions = await prisma.studySession.findMany({
      where: {
        userId,
        completedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const weeklyStats = {
      minutesStudied: weeklySessions.reduce(
        (sum: number, s) => sum + s.minutes,
        0,
      ),
      sessionsCompleted: weeklySessions.length,
      xpEarned: weeklySessions.reduce((sum: number, s) => sum + s.xpEarned, 0),
    };

    const recentSessions = await prisma.studySession.findMany({
      where: { userId },
      take: 5,
      orderBy: { completedAt: "desc" },
      include: {
        topic: {
          select: {
            name: true,
          },
        },
      },
    });

    return ok({
      user,
      nextTopic,
      weeklyStats,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        topicName: s.topic.name,
        minutes: s.minutes,
        xpEarned: s.xpEarned,
        completedAt: s.completedAt,
      })),
    });
  } catch (error) {
    console.error("getDashboardData error:", error);
    return err("Erro ao carregar dados do dashboard");
  }
}
