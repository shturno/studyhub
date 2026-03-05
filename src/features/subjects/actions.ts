"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";
import { SubjectStats, TopicWithStatus } from "./types";

const subjectInclude = {
  subjects: {
    include: {
      topics: {
        include: {
          studySessions: true,
        },
      },
    },
  },
} as const;

export async function getUserSubjects(
  contestId?: string,
): Promise<ActionResult<SubjectStats[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");
    const userId = session.user.id;

    const contest = contestId
      ? await prisma.contest.findUnique({
          where: { id: contestId, userId },
          include: subjectInclude,
        })
      : await prisma.contest.findFirst({
          where: { userId },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
          include: subjectInclude,
        });

    if (!contest) return ok([]);

    const subjects = contest.subjects.map((subject) => {
      const totalTopics = subject.topics.length;

      const completedTopics = subject.topics.filter(
        (t) => t.studySessions.length > 0,
      ).length;

      const totalMinutes = subject.topics.reduce((acc, t) => {
        return acc + t.studySessions.reduce((sAcc, s) => sAcc + s.minutes, 0);
      }, 0);

      const progress =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        id: subject.id,
        name: subject.name,
        topicsCount: totalTopics,
        completedTopics,
        progress,
        totalMinutesStudied: totalMinutes,
      };
    });

    return ok(subjects);
  } catch {
    return err("Erro ao carregar matérias");
  }
}

export async function getSubjectDetails(
  subjectId: string,
): Promise<
  ActionResult<{ subjectName: string; topics: TopicWithStatus[] } | null>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        contest: { select: { userId: true } },
        topics: {
          include: {
            studySessions: {
              orderBy: { completedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!subject || subject.contest.userId !== session.user.id) return ok(null);

    const topics: TopicWithStatus[] = subject.topics.map((topic) => {
      const hasStudied = topic.studySessions.length > 0;

      const totalMinutes = topic.studySessions.reduce(
        (acc, s) => acc + s.minutes,
        0,
      );
      const isMastered = totalMinutes > 60;

      let status: "pending" | "studied" | "mastered" = "pending";
      if (isMastered) status = "mastered";
      else if (hasStudied) status = "studied";

      return {
        id: topic.id,
        name: topic.name,
        status,
        lastStudiedAt: topic.studySessions[0]?.completedAt,
        xpEarned: topic.studySessions.reduce((acc, s) => acc + s.xpEarned, 0),
        parentId: topic.parentId,
      };
    });

    return ok({
      subjectName: subject.name,
      topics,
    });
  } catch {
    return err("Erro ao carregar detalhes da matéria");
  }
}

export async function updateSubject(
  id: string,
  data: { name: string },
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const trimmed = data.name.trim();
    if (!trimmed || trimmed.length < 2) return err("Nome muito curto");
    if (trimmed.length > 100) return err("Nome muito longo");

    const subject = await prisma.subject.findUnique({
      where: { id },
      select: { contest: { select: { userId: true } } },
    });

    if (!subject || subject.contest.userId !== session.user.id) {
      return err("Não autorizado");
    }

    await prisma.subject.update({ where: { id }, data: { name: trimmed } });

    revalidatePath("/subjects", "page");
    return ok(undefined);
  } catch {
    return err("Erro ao atualizar matéria");
  }
}
