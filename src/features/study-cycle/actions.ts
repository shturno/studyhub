"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePlannedSession(data: {
  lessonId: string;
  date: string;
  duration: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const newSession = await prisma.plannedSession.create({
    data: {
      userId: session.user.id,
      topicId: data.lessonId,
      scheduledDate: new Date(data.date),
      durationMinutes: data.duration,
    },
  });

  revalidatePath("/planner");
  return newSession;
}

export async function removePlannedSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.plannedSession.delete({
    where: { id: sessionId, userId: session.user.id },
  });

  revalidatePath("/planner");
}
