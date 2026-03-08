"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";

export async function createTopic(data: {
  name: string;
  subjectId: string;
  parentId?: string;
}): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await prisma.topic.create({
      data: {
        name: data.name,
        subjectId: data.subjectId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/[locale]/subjects/[id]", "page");
    return ok(undefined);
  } catch (error) {
    console.error("createTopic error:", error);
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
  } catch (error) {
    console.error("deleteTopic error:", error);
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
  } catch (error) {
    console.error("updateTopic error:", error);
    return err("Erro ao atualizar tópico");
  }
}
