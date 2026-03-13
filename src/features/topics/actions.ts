"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";
import { getGenAI } from "@/lib/gemini";
import { refreshMissionProgress, checkAllMissionsCompleted } from "@/features/gamification/services/missionService";
import { recordActivityEvent } from "@/features/gamification/services/activityEventService";

// ---------------------------------------------------------------------------
// Question generation types
// ---------------------------------------------------------------------------

export interface GeneratedQuestionData {
  id: string;
  statement: string;
  type: "CERTO_ERRADO" | "MULTIPLA_ESCOLHA";
  options: Array<{ key: string; text: string }> | null;
  answer: string;
  explanation: string;
}

export interface GenerateQuestionsResult {
  questions: GeneratedQuestionData[];
  fromCache: boolean;
}

// ---------------------------------------------------------------------------
// Generate questions via Gemini (with cache)
// ---------------------------------------------------------------------------

const MAX_QUESTIONS = 20;

export async function generateQuestions(
  topicId: string,
  contestId: string | null,
  quantity = 5,
): Promise<ActionResult<GenerateQuestionsResult>> {
  quantity = Math.min(Math.max(1, quantity), MAX_QUESTIONS);
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const userId = session.user.id;

    const topicOwnership = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { subject: { select: { contest: { select: { userId: true } } } } },
    });

    if (!topicOwnership || topicOwnership.subject.contest.userId !== userId) {
      return err("Não autorizado");
    }

    const cached = await prisma.generatedQuestion.findMany({
      where: { userId, topicId, usedAt: null },
      orderBy: { createdAt: "asc" },
      take: quantity,
    });

    if (cached.length >= quantity) {
      return ok({ questions: cached.map(toQuestionData), fromCache: true });
    }

    const [topic, contest] = await Promise.all([
      prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } }),
      contestId
        ? prisma.contest.findUnique({ where: { id: contestId } })
        : prisma.contest.findFirst({
            where: { userId },
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          }),
    ]);

    if (!topic) return err("Tópico não encontrado");

    const banca = contest?.banca ?? null;
    const role = contest?.role ?? "candidato";
    const isCespeLike =
      banca?.toLowerCase().includes("cespe") ||
      banca?.toLowerCase().includes("cebraspe");

    const questionType: "CERTO_ERRADO" | "MULTIPLA_ESCOLHA" = isCespeLike
      ? "CERTO_ERRADO"
      : "MULTIPLA_ESCOLHA";

    const needed = quantity - cached.length;
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = questionType === "CERTO_ERRADO"
      ? `Você é um especialista em elaboração de questões para concursos públicos no estilo CESPE/CEBRASPE.
Crie exatamente ${needed} questões de CERTO ou ERRADO sobre "${topic.name}" (matéria: ${topic.subject.name}).
Contexto: cargo "${role}"${banca ? `, banca ${banca}` : ""}.${topic.description ? `\nConteúdo: ${topic.description}` : ""}

Regras: questões objetivas, mix ~60% CERTO / ~40% ERRADO, nível adequado ao cargo, explicação com fundamentação.

Retorne SOMENTE um array JSON:
[{"statement":"...","type":"CERTO_ERRADO","options":null,"answer":"CERTO","explanation":"..."}]`
      : `Você é um especialista em questões para concursos públicos estilo ${banca ?? "FCC/VUNESP"}.
Crie exatamente ${needed} questões de múltipla escolha (A-E) sobre "${topic.name}" (matéria: ${topic.subject.name}).
Contexto: cargo "${role}"${banca ? `, banca ${banca}` : ""}.${topic.description ? `\nConteúdo: ${topic.description}` : ""}

Regras: 5 alternativas, só UMA correta, distratores plausíveis, nível adequado, explicação completa.

Retorne SOMENTE um array JSON:
[{"statement":"...","type":"MULTIPLA_ESCOLHA","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."},{"key":"E","text":"..."}],"answer":"B","explanation":"B está correta porque..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return err("IA não retornou questões válidas");

    const parsed: Array<{
      statement: string;
      type: string;
      options: Array<{ key: string; text: string }> | null;
      answer: string;
      explanation: string;
    }> = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed) || parsed.length === 0) return err("IA não retornou questões válidas");

    // 3. Cache new questions
    const created = await prisma.$transaction(
      parsed.map((q) =>
        prisma.generatedQuestion.create({
          data: {
            userId,
            topicId,
            contestId: contestId ?? null,
            statement: q.statement,
            type: q.type,
            options: q.options ?? undefined,
            answer: q.answer,
            explanation: q.explanation,
          },
        }),
      ),
    );

    const all = [...cached.map(toQuestionData), ...created.map(toQuestionData)];
    return ok({ questions: all.slice(0, quantity), fromCache: false });
  } catch {
    return err("Erro ao gerar questões. Tente novamente.");
  }
}

// ---------------------------------------------------------------------------
// Log a completed question session
// ---------------------------------------------------------------------------

export interface LogQuestionsInput {
  topicId: string;
  contestId?: string;
  questionIds: string[];
  correct: number;
  total: number;
}

export async function logQuestionSession(
  input: LogQuestionsInput,
): Promise<ActionResult<{ xpEarned: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const userId = session.user.id;
    const xpEarned = input.correct * 3;

    await prisma.$transaction([
      prisma.generatedQuestion.updateMany({
        where: { id: { in: input.questionIds }, userId },
        data: { usedAt: new Date() },
      }),
      prisma.questionLog.create({
        data: {
          userId,
          topicId: input.topicId,
          contestId: input.contestId ?? null,
          total: input.total,
          correct: input.correct,
          xpEarned,
          source: "GEMINI",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: xpEarned } },
      }),
    ]);

    await refreshMissionProgress(userId).catch(() => undefined);
    const bonusXP = await checkAllMissionsCompleted(userId).catch(() => 0);
    if (bonusXP > 0) {
      await prisma.user.update({ where: { id: userId }, data: { xp: { increment: bonusXP } } });
    }

    await recordActivityEvent(userId, "QUESTIONS_LOGGED", {
      total: input.total,
      correct: input.correct,
      xp: xpEarned,
    }).catch(() => undefined);

    revalidatePath("/[locale]/dashboard", "page");
    return ok({ xpEarned });
  } catch {
    return err("Erro ao registrar questões");
  }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function toQuestionData(q: {
  id: string;
  statement: string;
  type: string;
  options: unknown;
  answer: string;
  explanation: string;
}): GeneratedQuestionData {
  return {
    id: q.id,
    statement: q.statement,
    type: q.type as "CERTO_ERRADO" | "MULTIPLA_ESCOLHA",
    options: Array.isArray(q.options) ? (q.options as Array<{ key: string; text: string }>) : null,
    answer: q.answer,
    explanation: q.explanation,
  };
}



export async function createTopic(data: {
  name: string;
  subjectId: string;
  parentId?: string;
}): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const subjectOwnership = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { contest: { select: { userId: true } } },
    });

    if (!subjectOwnership || subjectOwnership.contest.userId !== session.user.id) {
      return err("Não autorizado");
    }

    if (data.parentId) {
      const parentOwnership = await prisma.topic.findUnique({
        where: { id: data.parentId },
        select: { subject: { select: { contest: { select: { userId: true } } } } },
      });

      if (!parentOwnership || parentOwnership.subject.contest.userId !== session.user.id) {
        return err("Não autorizado");
      }
    }

    await prisma.topic.create({
      data: {
        name: data.name,
        subjectId: data.subjectId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/[locale]/subjects/[id]", "page");
    return ok(undefined);
  } catch {
    return err("Erro ao criar tópico");
  }
}

export async function deleteTopic(id: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { subject: { select: { contest: { select: { userId: true } } } } },
    });

    if (!topic || topic.subject.contest.userId !== session.user.id) {
      return err("Não autorizado");
    }

    await prisma.topic.delete({ where: { id } });

    revalidatePath("/[locale]/subjects/[id]", "page");
    return ok(undefined);
  } catch {
    return err("Erro ao deletar tópico");
  }
}

export async function updateTopic(
  id: string,
  data: { name: string },
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const trimmed = data.name.trim();
    if (!trimmed || trimmed.length < 2) return err("Nome muito curto");
    if (trimmed.length > 100) return err("Nome muito longo");

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { subject: { select: { contest: { select: { userId: true } } } } },
    });

    if (!topic || topic.subject.contest.userId !== session.user.id) {
      return err("Não autorizado");
    }

    await prisma.topic.update({ where: { id }, data: { name: trimmed } });

    revalidatePath("/[locale]/subjects/[id]", "page");
    return ok(undefined);
  } catch {
    return err("Erro ao atualizar tópico");
  }
}
