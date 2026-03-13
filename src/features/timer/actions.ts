"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { studySessionSchema } from "@/lib/schemas";
import { ok, err, type ActionResult } from "@/lib/result";
import {
  calculateXP,
  calculateLevel,
  getXPForNextLevel,
} from "@/features/gamification/utils/xpCalculator";
import {
  calculateStreak,
  getStreakMultiplier,
} from "@/features/gamification/utils/streakCalculator";
import {
  checkAndUnlockAchievements,
  type UnlockedAchievement,
} from "@/features/gamification/services/achievementService";
import {
  refreshMissionProgress,
  checkAllMissionsCompleted,
} from "@/features/gamification/services/missionService";
import { scheduleReview } from "@/features/reviews/actions";
import { runLearningEngine } from "@/features/insights/services/learningEngine";
import { recordActivityEvent } from "@/features/gamification/services/activityEventService";
import {
  completeObligation,
  applyPendingPenalties,
} from "@/features/gamification/services/dailyObligationService";

export interface SaveStudySessionInput {
  topicId: string;
  minutes: number;
  difficulty: number | null;
}

export interface SaveStudySessionResult {
  sessionId: string;
  xpEarned: number;
  newLevel: number;
  leveledUp: boolean;
  xpToNextLevel: number;
  newAchievements: UnlockedAchievement[];
  streak: number;
  isNewStreakDay: boolean;
  streakMultiplier: number;
  missionBonusXP: number;
  streakPenaltyXP: number;
  streakLost: number;
}

export async function saveStudySession(
  data: SaveStudySessionInput,
): Promise<ActionResult<SaveStudySessionResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Não autorizado");
    }

    const parsed = studySessionSchema.safeParse(data);
    if (!parsed.success) {
      return err(parsed.error.errors[0]?.message || "Dados inválidos");
    }

    const userId = session.user.id;

    const topicOwnership = await prisma.topic.findUnique({
      where: { id: parsed.data.topicId },
      select: { subject: { select: { contest: { select: { userId: true } } } } },
    });

    if (!topicOwnership || topicOwnership.subject.contest.userId !== userId) {
      return err("Não autorizado");
    }

    const userStreak = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true, lastStudyDate: true },
    });

    const { newStreak, isNewDay, xpPenalty: streakXpPenalty, streakLost } = calculateStreak(
      userStreak?.lastStudyDate ?? null,
      userStreak?.streakDays ?? 0,
    );
    const multiplier = getStreakMultiplier(newStreak);
    const baseXP = calculateXP(parsed.data.minutes);
    const xpEarned = Math.round(baseXP * multiplier);

    // Aplica penalidade por quebra de streak (mas garante xp >= 0)
    const [newSession, updatedUser] = await prisma.$transaction([
      prisma.studySession.create({
        data: {
          userId,
          topicId: parsed.data.topicId,
          minutes: parsed.data.minutes,
          xpEarned,
          difficulty: parsed.data.difficulty,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: streakXpPenalty > 0
            ? { increment: xpEarned - streakXpPenalty }  // ganha XP mas perde penalidade
            : { increment: xpEarned },
          streakDays: newStreak,
          ...(isNewDay ? { lastStudyDate: new Date() } : {}),
        },
        select: { xp: true, level: true },
      }),
    ]);

    // Garante xp >= 0
    if (streakXpPenalty > 0) {
      await prisma.user.updateMany({
        where: { id: userId, xp: { lt: 0 } },
        data: { xp: 0 },
      });
    }

    const newXp = updatedUser.xp;
    const prevLevel = updatedUser.level;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > prevLevel;
    const xpToNextLevel = getXPForNextLevel(newXp, newLevel);

    if (newLevel !== prevLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    const newAchievements = await checkAndUnlockAchievements(userId);

    // Refresh daily mission progress and award bonus if all completed
    await refreshMissionProgress(userId).catch(() => undefined);
    const missionBonusXP = await checkAllMissionsCompleted(userId).catch(() => 0);
    if (missionBonusXP > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: missionBonusXP } },
      }).catch(() => undefined);
    }

    await scheduleReview(parsed.data.topicId).catch(() => undefined);

    // Registra eventos no feed de atividade (fire-and-forget)
    const topicMeta = await prisma.topic
      .findUnique({ where: { id: parsed.data.topicId }, select: { name: true, subjectId: true } })
      .catch(() => null);

    void recordActivityEvent(userId, "SESSION_COMPLETED", {
      xp: xpEarned,
      topicName: topicMeta?.name ?? "Tópico",
      minutes: parsed.data.minutes,
    }).catch(() => undefined);

    if (streakXpPenalty > 0 && streakLost > 0) {
      void recordActivityEvent(userId, "STREAK_BROKEN", {
        streakLost,
        penalty: streakXpPenalty,
      }).catch(() => undefined);
    }

    if (leveledUp) {
      void recordActivityEvent(userId, "LEVEL_UP", { level: newLevel }).catch(() => undefined);
    }

    for (const ach of newAchievements) {
      void recordActivityEvent(userId, "ACHIEVEMENT", {
        achievementName: ach.name,
        achievementIcon: ach.icon,
      }).catch(() => undefined);
    }

    // Aplica penalidades de obrigações passadas não cumpridas (lazy, sem cron)
    await applyPendingPenalties(userId).catch(() => undefined);

    // Marca obrigação de hoje como cumprida se aplicável
    await completeObligation(userId, parsed.data.topicId, parsed.data.minutes).catch(() => undefined);

    // Fire-and-forget: update learning engine (never blocks session save)
    if (topicMeta) {
      void runLearningEngine({
        userId,
        topicId: parsed.data.topicId,
        subjectId: topicMeta.subjectId,
        minutes: parsed.data.minutes,
        difficulty: parsed.data.difficulty ?? null,
        startedAt: newSession.startedAt,
      });
    }

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/gamification", "page");

    return ok({
      sessionId: newSession.id,
      xpEarned,
      newLevel,
      leveledUp,
      xpToNextLevel,
      newAchievements,
      streak: newStreak,
      isNewStreakDay: isNewDay,
      streakMultiplier: multiplier,
      missionBonusXP,
      streakPenaltyXP: streakXpPenalty,
      streakLost,
    });
  } catch {
    return err("Erro ao salvar sessão");
  }
}

export async function updateSessionDifficulty(
  sessionId: string,
  difficulty: number,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Não autorizado");
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!studySession || studySession.userId !== session.user.id) {
      return err("Não autorizado");
    }

    await prisma.studySession.update({
      where: { id: sessionId },
      data: { difficulty },
    });

    revalidatePath("/dashboard");
    return ok(undefined);
  } catch {
    return err("Erro ao atualizar dificuldade");
  }
}
