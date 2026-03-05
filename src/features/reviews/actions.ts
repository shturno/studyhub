"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";
import { sm2 } from "./services/sm2";
import type { ReviewQuality, ReviewWithTopic } from "./types";

/**
 * Agenda uma revisão para D+1 após uma sessão de estudo.
 * Idempotente: se já existe revisão pendente para o tópico, não duplica.
 */
export async function scheduleReview(
  topicId: string,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.id) return err("Não autorizado");
  const userId = session.user.id;

  const existing = await prisma.reviewQueue.findFirst({
    where: { topicId, userId, completed: false },
  });
  if (existing) return ok(undefined);

  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 1);

  await prisma.reviewQueue.create({
    data: { topicId, userId, scheduledFor },
  });

  revalidatePath("/reviews");
  return ok(undefined);
}

/**
 * Retorna as revisões pendentes até hoje (scheduledFor <= agora).
 */
export async function getTodayReviews(): Promise<
  ActionResult<ReviewWithTopic[]>
> {
  const session = await auth();
  if (!session?.user?.id) return err("Não autorizado");

  const reviews = await prisma.reviewQueue.findMany({
    where: {
      userId: session.user.id,
      completed: false,
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: "asc" },
    include: {
      topic: {
        select: {
          name: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  return ok(
    reviews.map((r) => ({
      id: r.id,
      topicId: r.topicId,
      topicName: r.topic.name,
      subjectName: r.topic.subject.name,
      scheduledFor: r.scheduledFor,
      interval: r.interval,
      easeFactor: r.easeFactor,
      repetitions: r.repetitions,
    })),
  );
}

/**
 * Retorna a data da próxima revisão futura (para tela de "tudo em dia").
 */
export async function getNextReviewDate(): Promise<ActionResult<Date | null>> {
  const session = await auth();
  if (!session?.user?.id) return err("Não autorizado");

  const next = await prisma.reviewQueue.findFirst({
    where: {
      userId: session.user.id,
      completed: false,
    },
    orderBy: { scheduledFor: "asc" },
    select: { scheduledFor: true },
  });

  return ok(next?.scheduledFor ?? null);
}

/**
 * Marca uma revisão como concluída, aplica SM-2 e agenda a próxima.
 */
export async function completeReview(
  reviewId: string,
  quality: ReviewQuality,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.id) return err("Não autorizado");

  const review = await prisma.reviewQueue.findUnique({
    where: { id: reviewId },
  });

  if (!review) return err("Revisão não encontrada");
  if (review.userId !== session.user.id) return err("Não autorizado");

  // Marcar como concluída
  await prisma.reviewQueue.update({
    where: { id: reviewId },
    data: { completed: true, completedAt: new Date() },
  });

  // Calcular próxima revisão via SM-2
  const result = sm2({
    quality,
    interval: review.interval,
    easeFactor: review.easeFactor,
    repetitions: review.repetitions,
  });

  // Criar nova entrada com os dados SM-2 atualizados
  await prisma.reviewQueue.create({
    data: {
      topicId: review.topicId,
      userId: review.userId,
      scheduledFor: result.scheduledFor,
      interval: result.nextInterval,
      easeFactor: result.nextEaseFactor,
      repetitions: result.nextRepetitions,
    },
  });

  revalidatePath("/reviews");
  return ok(undefined);
}
