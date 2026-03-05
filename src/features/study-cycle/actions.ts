"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/lib/result";
import type { PlannedSession } from "./types";

export async function savePlannedSession(data: {
  lessonId: string;
  date: string;
  duration: number;
}): Promise<ActionResult<PlannedSession>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const newSession = await prisma.plannedSession.create({
      data: {
        userId: session.user.id,
        topicId: data.lessonId,
        scheduledDate: new Date(data.date),
        durationMinutes: data.duration,
      },
    });

    revalidatePath("/planner");
    return ok({
      id: newSession.id,
      lessonId: newSession.topicId,
      lessonTitle: "",
      trackName: "",
      duration: newSession.durationMinutes,
      scheduledDate: newSession.scheduledDate.toISOString(),
      draft: false,
    } satisfies PlannedSession);
  } catch (error) {
    console.error("savePlannedSession error:", error);
    return err("Erro ao salvar sessão planejada");
  }
}

export async function removePlannedSession(
  sessionId: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await prisma.plannedSession.delete({
      where: { id: sessionId, userId: session.user.id },
    });

    revalidatePath("/planner");
    return ok(undefined);
  } catch (error) {
    console.error("removePlannedSession error:", error);
    return err("Erro ao remover sessão");
  }
}
