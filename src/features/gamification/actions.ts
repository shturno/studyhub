"use server";

import { prisma } from "@/lib/prisma";
import { getXPForNextLevel } from "./utils/xpCalculator";

import { auth } from "@/lib/auth";

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
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

  if (!user) return null;

  const allAchievements = await prisma.achievement.findMany();

  const unlockedIds = new Set(
    user.achievements.map((ua: { achievementId: string }) => ua.achievementId),
  );

  const achievementsWithStatus = allAchievements.map((ach: { id: string }) => ({
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

  return {
    user,
    achievements: achievementsWithStatus,
    stats: {
      totalSessions,
      totalHours: Math.round(totalMinutes / 60),
      xpToNextLevel: xpToNext,
    },
  };
}
