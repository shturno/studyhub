"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";

export async function fuseContests(
  contestIds: string[],
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    if (contestIds.length < 2) {
      return err("É necessário pelo menos 2 editais para a fusão");
    }

  const userId = session.user.id;

    const contests = await prisma.contest.findMany({
      where: {
        id: { in: contestIds },
        userId,
      },
      include: {
        subjects: {
          include: {
            topics: true,
          },
        },
      },
    });

    if (contests.length !== contestIds.length) {
      return err("Alguns concursos selecionados não foram encontrados");
    }

    const fusedName = `Super-Ciclo: ${contests.map((c) => c.name.split(" ")[0]).join(" + ")}`;

    const baseSlug = fusedName
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-");
    const uniqueSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const finalSlug = `${baseSlug}-${uniqueSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const fusedContest = await tx.contest.create({
        data: {
          userId,
          name: fusedName,
          slug: finalSlug,
          institution: "Laboratório StudyHub",
          role: "Edital Otimizado (Múltiplos)",
          isPrimary: true,
        },
      });

      await tx.contest.updateMany({
        where: {
          userId,
          id: { not: fusedContest.id },
          isPrimary: true,
        },
        data: { isPrimary: false },
      });

      const subjectMap = new Map<string, string>();
      const topicMap = new Map<string, string>();

      for (const contest of contests) {
        for (const subject of contest.subjects) {
          const normalizedSubjName = subject.name.trim().toLowerCase();

          let fusedSubjectId = subjectMap.get(normalizedSubjName);

          if (!fusedSubjectId) {
            const newSubject = await tx.subject.create({
              data: {
                name: subject.name,
                contestId: fusedContest.id,
              },
            });
            fusedSubjectId = newSubject.id;
            subjectMap.set(normalizedSubjName, fusedSubjectId);
          }

          for (const topic of subject.topics) {
            const normalizedTopicName = `${normalizedSubjName}::${topic.name.trim().toLowerCase()}`;

            if (!topicMap.has(normalizedTopicName)) {
              const newTopic = await tx.topic.create({
                data: {
                  name: topic.name,
                  subjectId: fusedSubjectId,
                },
              });
              topicMap.set(normalizedTopicName, newTopic.id);
            }
          }
        }
      }

      return fusedContest;
    });

    revalidatePath("/[locale]/contests", "page");
    revalidatePath("/[locale]/dashboard", "page");

    return ok(result);
  } catch (error) {
    console.error("fuseContests error:", error);
    return err("Erro ao fusionar concursos");
  }
}
