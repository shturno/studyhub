"use server";

import { prisma } from "@/lib/prisma";
import { getXPForNextLevel } from "./utils/xpCalculator";
import { auth } from "@/lib/auth";
import { ok, err, type ActionResult } from "@/lib/result";

export async function getUserProfile(): Promise<
  ActionResult<{
    user: {
      id: string;
      name: string;
      email: string;
      xp: number;
      level: number;
    };
    achievements: Array<{
      id: string;
      name: string;
      isUnlocked: boolean;
      unlockedAt: Date | null;
    }>;
    stats: {
      totalSessions: number;
      totalHours: number;
      xpToNextLevel: number;
    };
  } | null>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: { achievement: true },
        },
        studySessions: true,
      },
    });

    if (!user) return ok(null);

    const allAchievements = await prisma.achievement.findMany();

    const unlockedIds = new Set(
      user.achievements.map((ua: { achievementId: string }) => ua.achievementId),
    );

    const achievementsWithStatus = allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedIds.has(ach.id),
      unlockedAt:
        user.achievements.find(
          (ua: { achievementId: string }) => ua.achievementId === ach.id,
        )?.unlockedAt || null,
    }));

    const totalSessions = user.studySessions.length;
    const totalMinutes = user.studySessions.reduce(
      (acc: number, s: { minutes: number }) => acc + s.minutes,
      0,
    );
    const xpToNext = getXPForNextLevel(user.xp, user.level + 1);

    return ok({
      user: {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        xp: user.xp,
        level: user.level,
      },
      achievements: achievementsWithStatus,
      stats: {
        totalSessions,
        totalHours: Math.round(totalMinutes / 60),
        xpToNextLevel: xpToNext,
      },
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return err("Erro ao carregar perfil");
  }
}
