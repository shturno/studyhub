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

    revalidatePath("/subjects/[id]", "page");
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

    await prisma.topic.delete({
      where: { id },
    });

    revalidatePath("/subjects/[id]", "page");
    return ok(undefined);
  } catch (error) {
    console.error("deleteTopic error:", error);
    return err("Erro ao deletar tópico");
  }
}
