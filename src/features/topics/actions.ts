"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTopic(data: {
  name: string;
  subjectId: string;
  parentId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.topic.create({
    data: {
      name: data.name,
      subjectId: data.subjectId,
      parentId: data.parentId,
    },
  });

  revalidatePath("/subjects/[id]", "page");
}

export async function deleteTopic(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.topic.delete({
    where: { id },
  });

  revalidatePath("/subjects/[id]", "page");
}
