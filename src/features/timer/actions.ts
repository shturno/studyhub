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
  checkAndUnlockAchievements,
  type UnlockedAchievement,
} from "@/features/gamification/services/achievementService";

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
    const xpEarned = calculateXP(parsed.data.minutes);

    const newSession = await prisma.studySession.create({
      data: {
        userId,
        topicId: parsed.data.topicId,
        minutes: parsed.data.minutes,
        xpEarned,
        difficulty: parsed.data.difficulty,
      },
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
      },
    });

    const newLevel = calculateLevel(user.xp);
    const leveledUp = newLevel > user.level;

    if (leveledUp) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    const xpToNextLevel = getXPForNextLevel(user.xp, newLevel);

    const newAchievements = await checkAndUnlockAchievements(userId);

    revalidatePath("/dashboard");
    revalidatePath("/gamification");

    return ok({
      sessionId: newSession.id,
      xpEarned,
      newLevel,
      leveledUp,
      xpToNextLevel,
      newAchievements,
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
  } catch (error) {
    console.error("updateSessionDifficulty error:", error);
    return err("Erro ao atualizar dificuldade");
  }
}
