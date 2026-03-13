"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";
import { unlockAchievementBySlug } from "@/features/gamification/services/achievementService";
import type { UnlockedAchievement } from "@/features/gamification/services/achievementService";
import type { ContestForSchedule } from "@/features/study-cycle/services/multiContestPriorityService";

export async function getContests() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.contest.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      isPrimary: "desc",
    },
  });
}

export async function createContest(data: {
  name: string;
  institution: string;
  role: string;
  examDate?: Date;
  isPrimary?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const uniqueSuffix = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    const finalSlug = `${baseSlug}-${uniqueSuffix}`;

    await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.contest.updateMany({
          where: { userId: session.user.id, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      await tx.contest.create({
        data: {
          name: data.name,
          institution: data.institution,
          role: data.role,
          examDate: data.examDate,
          isPrimary: data.isPrimary,
          slug: finalSlug,
          userId: session.user.id,
        },
      });
    });

    revalidatePath("/[locale]/contests", "page");
    revalidatePath("/[locale]/dashboard", "page");
    const newAchievement = await unlockAchievementBySlug(
      session.user.id,
      "first_contest",
    );
    const newAchievements: UnlockedAchievement[] = newAchievement
      ? [newAchievement]
      : [];
    return { success: true as const, newAchievements };
  } catch {
    return { error: "Erro interno ao salvar no banco de dados." };
  }
}

export async function deleteContest(id: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await prisma.contest.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/contests");
    return ok(undefined);
  } catch (error) {
    console.error("deleteContest error:", error);
    return err("Erro ao deletar concurso");
  }
}

export async function updateContest(
  id: string,
  data: {
    examDate?: Date | null;
    manualPriority?: number;
    name?: string;
    institution?: string;
    role?: string;
    isPrimary?: boolean;
  },
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.contest.updateMany({
          where: { userId: session.user.id, isPrimary: true, id: { not: id } },
          data: { isPrimary: false },
        });
      }
      await tx.contest.update({
        where: { id, userId: session.user.id },
        data: {
          ...(data.examDate !== undefined ? { examDate: data.examDate } : {}),
          ...(data.manualPriority !== undefined ? { manualPriority: data.manualPriority } : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.institution !== undefined ? { institution: data.institution } : {}),
          ...(data.role !== undefined ? { role: data.role } : {}),
          ...(data.isPrimary !== undefined ? { isPrimary: data.isPrimary } : {}),
        },
      });
    });

    revalidatePath("/[locale]/contests", "page");
    revalidatePath("/[locale]/planner", "page");
    return ok(undefined);
  } catch (error) {
    console.error("updateContest error:", error);
    return err("Erro ao atualizar concurso");
  }
}

/**
 * Returns enriched contest data (with study-session minutes per topic) needed
 * by the multi-contest schedule generator.
 */
export async function getMultiContestScheduleData(
  contestIds: string[],
): Promise<ContestForSchedule[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const contests = await prisma.contest.findMany({
    where: { id: { in: contestIds }, userId },
    include: {
      subjects: {
        include: { topics: true },
      },
    },
  });

  // Aggregate studied minutes per topic (across all StudySessions for this user)
  const topicIds = contests.flatMap((c) =>
    c.subjects.flatMap((s) => s.topics.map((t) => t.id)),
  );

  const studySessions = await prisma.studySession.groupBy({
    by: ["topicId"],
    where: { userId, topicId: { in: topicIds } },
    _sum: { minutes: true },
  });

  const minutesMap = new Map<string, number>(
    studySessions.map((s) => [s.topicId, s._sum.minutes ?? 0]),
  );

  return contests.map((contest) => ({
    id: contest.id,
    name: contest.name,
    examDate: contest.examDate,
    manualPriority: contest.manualPriority,
    subjects: contest.subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      weight: subject.weight,
      userLevel: subject.userLevel,
      topics: subject.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        studiedMinutes: minutesMap.get(topic.id) ?? 0,
      })),
    })),
  }));
}
