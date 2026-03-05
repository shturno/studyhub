"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, type ActionResult } from "@/lib/result";
import { SubjectStats, TopicWithStatus } from "./types";

export async function getUserSubjects(): Promise<
  ActionResult<SubjectStats[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const contest = await prisma.contest.findFirst({
      where: { userId: session.user.id },
      include: {
        subjects: {
          include: {
            topics: {
              include: {
                studySessions: true,
              },
            },
          },
        },
      },
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
  } catch (error) {
    console.error("getUserSubjects error:", error);
    return err("Erro ao carregar matérias");
  }
}

export async function getSubjectDetails(
  subjectId: string,
): Promise<
  ActionResult<{ subjectName: string; topics: TopicWithStatus[] } | null>
> {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
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

    if (!subject) return ok(null);

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
  } catch (error) {
    console.error("getSubjectDetails error:", error);
    return err("Erro ao carregar detalhes da matéria");
  }
}
