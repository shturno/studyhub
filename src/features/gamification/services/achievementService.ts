import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export interface UnlockedAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export async function checkAndUnlockAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const [user, sessionStats, recentSessionDates, allAchievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          achievements: { select: { achievementId: true } },
          contests: { select: { id: true } },
        },
      }),
      prisma.studySession.aggregate({
        where: { userId },
        _sum: { minutes: true },
        _count: { id: true },
      }),
      prisma.studySession.findMany({
        where: { userId, startedAt: { gte: subDays(new Date(), 35) } },
        select: { startedAt: true },
        orderBy: { startedAt: "desc" },
      }),
      prisma.achievement.findMany(),
    ]);

  if (!user) return [];

  const alreadyUnlocked = new Set(
    user.achievements.map((ua) => ua.achievementId),
  );

  const totalSessions = sessionStats._count.id;
  const totalMinutes = sessionStats._sum.minutes ?? 0;
  const totalHours = totalMinutes / 60;
  const currentLevel = user.level;
  const totalContests = user.contests.length;
  const streak = calculateStudyStreak(
    recentSessionDates.map((s) => s.startedAt),
  );

  const rules: Record<string, boolean> = {
    welcome: true,
    first_session: totalSessions >= 1,
    sessions_10: totalSessions >= 10,
    sessions_50: totalSessions >= 50,
    sessions_100: totalSessions >= 100,
    hours_10: totalHours >= 10,
    hours_50: totalHours >= 50,
    hours_100: totalHours >= 100,
    streak_3: streak >= 3,
    streak_7: streak >= 7,
    streak_30: streak >= 30,
    level_5: currentLevel >= 5,
    level_10: currentLevel >= 10,
    first_contest: totalContests >= 1,
  };

  const toUnlock = allAchievements.filter(
    (ach) => rules[ach.slug] === true && !alreadyUnlocked.has(ach.id),
  );

  if (toUnlock.length === 0) return [];

  await prisma.userAchievement.createMany({
    data: toUnlock.map((ach) => ({
      userId,
      achievementId: ach.id,
    })),
    skipDuplicates: true,
  });

  const totalBonusXP = toUnlock.reduce((acc, ach) => acc + ach.xpReward, 0);
  if (totalBonusXP > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: totalBonusXP } },
    });
  }

  return toUnlock.map((ach) => ({
    id: ach.id,
    slug: ach.slug,
    name: ach.name,
    description: ach.description,
    icon: ach.icon,
    xpReward: ach.xpReward,
  }));
}

export async function unlockAchievementBySlug(
  userId: string,
  slug: string,
): Promise<UnlockedAchievement | null> {
  const achievement = await prisma.achievement.findUnique({ where: { slug } });
  if (!achievement) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return null;

  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });

  if (achievement.xpReward > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: achievement.xpReward } },
    });
  }

  return {
    id: achievement.id,
    slug: achievement.slug,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    xpReward: achievement.xpReward,
  };
}

function calculateStudyStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0;

  const daySet = new Set(sessionDates.map((d) => d.toISOString().slice(0, 10)));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const cursor = new Date(today);
  if (!daySet.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
