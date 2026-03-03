"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  calculateXP,
  calculateLevel,
  getXPForNextLevel,
} from "@/features/gamification/utils/xpCalculator";
import { revalidatePath } from "next/cache";

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
}

import { studySessionSchema } from "@/lib/schemas";

export async function saveStudySession(
  data: SaveStudySessionInput,
): Promise<SaveStudySessionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = studySessionSchema.parse(data);
  const userId = session.user.id;

  const xpEarned = calculateXP(parsed.minutes);

  const newSession = await prisma.studySession.create({
    data: {
      userId,
      topicId: parsed.topicId,
      minutes: parsed.minutes,
      xpEarned,
      difficulty: parsed.difficulty,
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

  revalidatePath("/dashboard");

  return {
    sessionId: newSession.id,
    xpEarned,
    newLevel,
    leveledUp,
    xpToNextLevel,
  };
}

export async function updateSessionDifficulty(
  sessionId: string,
  difficulty: number,
) {
  await prisma.studySession.update({
    where: { id: sessionId },
    data: { difficulty },
  });

  revalidatePath("/dashboard");
}
