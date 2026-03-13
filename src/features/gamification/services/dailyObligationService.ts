import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";
import { recordActivityEvent } from "./activityEventService";

interface DifficultSubject {
  subjectId: string;
  contestId: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyObligationSummary {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  contestId: string | null;
  date: string;
  completed: boolean;
  completedAt: Date | null;
  xpPenalty: number;
  penaltyApplied: boolean;
  aiReasoning: string | null;
}

// ---------------------------------------------------------------------------
// Gemini: gera justificativa para estudar o tópico hoje
// ---------------------------------------------------------------------------

async function generateObligationReasoning(opts: {
  topicName: string;
  subjectName: string;
  contestName: string;
  contestBanca: string | null;
  contestRole: string;
  coveragePercent: number;
  examDate: Date | null;
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const daysUntilExam = opts.examDate
      ? Math.max(0, Math.round((opts.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    const prompt = `Você é um coach direto e sem rodeios para concursos públicos.
Escreva UMA frase curta (máx 20 palavras) justificando por que estudar "${opts.topicName}" de ${opts.subjectName} é OBRIGATÓRIO hoje para o concurso "${opts.contestName}" (${opts.contestRole}${opts.contestBanca ? `, banca ${opts.contestBanca}` : ""}).

Contexto:
- Cobertura atual do edital: ${opts.coveragePercent}%
- Dias até a prova: ${daysUntilExam !== null ? `${daysUntilExam} dias` : "data não definida"}

Regras:
- Tom urgente e direto, como um treinador bravo
- Mencione consequências concretas de não estudar isso
- Máximo 20 palavras, sem pontuação no final
- Responda SOMENTE a frase, sem aspas nem explicação

Exemplo: "Esse tópico cai todo concurso CESPE e sua cobertura está zerada"`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, "");
  } catch {
    return `Tópico prioritário com menor cobertura no seu edital — estude agora`;
  }
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Retorna a DailyObligation de hoje, criando-a com reasoning do Gemini se necessário.
 */
export async function getOrCreateTodayObligation(
  userId: string,
  contestId?: string,
): Promise<DailyObligationSummary | null> {
  const today = format(new Date(), "yyyy-MM-dd");

  // Busca obrigação já existente para hoje
  const existing = await prisma.dailyObligation.findUnique({
    where: { userId_date: { userId, date: today } },
    include: {
      topic: { include: { subject: true } },
      contest: true,
    },
  });

  if (existing) {
    return toSummary(existing);
  }

  // Busca o tópico com menor cobertura (nunca estudado ou menos estudado)
  const contest = contestId
    ? await prisma.contest.findUnique({
        where: { id: contestId, userId },
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  studySessions: { where: { userId }, select: { id: true }, take: 1 },
                },
              },
            },
          },
        },
      })
    : await prisma.contest.findFirst({
        where: { userId },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  studySessions: { where: { userId }, select: { id: true }, take: 1 },
                },
              },
            },
          },
        },
      });

  if (!contest) return null;

  const allTopics = contest.subjects.flatMap((s) =>
    s.topics.map((t) => ({ ...t, subjectName: s.name, subjectId: s.id })),
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });

  const settingsObj = user?.settings as Record<string, unknown>;
  const difficultSubjectsRaw = Array.isArray(settingsObj?.difficultSubjects)
    ? (settingsObj.difficultSubjects as (DifficultSubject | string)[])
    : [];

  const difficultSubjectIds = difficultSubjectsRaw.map((item) => {
    if (typeof item === "string") return item;
    return (item as DifficultSubject).subjectId;
  });

  interface TopicWithSubject {
    studySessions: { length: number };
    subjectId: string;
  }

  const difficultTopics = allTopics.filter((t: TopicWithSubject) =>
    difficultSubjectIds.includes(t.subjectId)
  );

  let targetTopic;
  if (difficultTopics.length > 0) {
    const unstudiedDifficult = difficultTopics.filter(
      (t: TopicWithSubject) => t.studySessions.length === 0
    );
    targetTopic = unstudiedDifficult[0] ?? difficultTopics[0];
  } else {
    const unstudied = allTopics.filter(
      (t: TopicWithSubject) => t.studySessions.length === 0
    );
    targetTopic = unstudied[0] ?? allTopics[0];
  }

  if (!targetTopic) return null;

  // Calcula cobertura atual
  const totalTopics = allTopics.length;
  const studiedCount = allTopics.filter((t) => t.studySessions.length > 0).length;
  const coveragePercent = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

  // Gera reasoning via Gemini
  const subjectName = targetTopic.subjectName;
  const aiReasoning = await generateObligationReasoning({
    topicName: targetTopic.name,
    subjectName,
    contestName: contest.name,
    contestBanca: contest.banca,
    contestRole: contest.role,
    coveragePercent,
    examDate: contest.examDate,
  });

  // Cria a obrigação
  const created = await prisma.dailyObligation.create({
    data: {
      userId,
      topicId: targetTopic.id,
      contestId: contest.id,
      date: today,
      xpPenalty: 25,
      aiReasoning,
    },
    include: {
      topic: { include: { subject: true } },
      contest: true,
    },
  });

  return toSummary(created);
}

/**
 * Marca a obrigação de hoje como cumprida, se o tópico bate e a sessão tem 15+ minutos.
 */
export async function completeObligation(
  userId: string,
  topicId: string,
  minutes: number,
): Promise<boolean> {
  if (minutes < 15) return false;

  const today = format(new Date(), "yyyy-MM-dd");
  const obligation = await prisma.dailyObligation.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!obligation || obligation.completed || obligation.topicId !== topicId) return false;

  await prisma.dailyObligation.update({
    where: { id: obligation.id },
    data: { completed: true, completedAt: new Date() },
  });

  return true;
}

/**
 * Aplica penalidades de XP por obrigações passadas não cumpridas.
 * Chamado no carregamento da dashboard — lazy, sem cron.
 * Retorna o total de XP subtraído (para exibir no modal de penalidade).
 */
export async function applyPendingPenalties(userId: string): Promise<{
  totalPenalty: number;
  missedDays: Array<{ date: string; topicName: string; xpPenalty: number; aiReasoning: string | null }>;
}> {
  const today = format(new Date(), "yyyy-MM-dd");

  const pending = await prisma.dailyObligation.findMany({
    where: {
      userId,
      completed: false,
      penaltyApplied: false,
      date: { lt: today }, // apenas dias anteriores
    },
    include: { topic: true },
    orderBy: { date: "asc" },
  });

  if (pending.length === 0) return { totalPenalty: 0, missedDays: [] };

  const totalPenalty = pending.reduce((sum, o) => sum + o.xpPenalty, 0);

  // Aplica subtração de XP (piso = 0)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          decrement: totalPenalty,
        },
      },
    }),
    // Garante que xp nunca fica negativo
    prisma.dailyObligation.updateMany({
      where: { id: { in: pending.map((o) => o.id) } },
      data: { penaltyApplied: true },
    }),
  ]);

  // Garante xp >= 0
  await prisma.user.updateMany({
    where: { id: userId, xp: { lt: 0 } },
    data: { xp: 0 },
  });

  // Registra events no feed
  for (const o of pending) {
    await recordActivityEvent(userId, "OBLIGATION_MISSED", {
      date: o.date,
      obligationTopic: o.topic.name,
      penalty: o.xpPenalty,
    }).catch(() => undefined);
  }

  return {
    totalPenalty,
    missedDays: pending.map((o) => ({
      date: o.date,
      topicName: o.topic.name,
      xpPenalty: o.xpPenalty,
      aiReasoning: o.aiReasoning,
    })),
  };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function toSummary(o: {
  id: string;
  topicId: string;
  topic: { name: string; subject: { name: string } };
  contestId: string | null;
  date: string;
  completed: boolean;
  completedAt: Date | null;
  xpPenalty: number;
  penaltyApplied: boolean;
  aiReasoning: string | null;
}): DailyObligationSummary {
  return {
    id: o.id,
    topicId: o.topicId,
    topicName: o.topic.name,
    subjectName: o.topic.subject.name,
    contestId: o.contestId,
    date: o.date,
    completed: o.completed,
    completedAt: o.completedAt,
    xpPenalty: o.xpPenalty,
    penaltyApplied: o.penaltyApplied,
    aiReasoning: o.aiReasoning,
  };
}
