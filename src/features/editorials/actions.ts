"use server";

import { auth } from "@/lib/auth";
import {
  createEditorialItem as createEditorialItemService,
  getEditorialItems,
  deleteEditorialItem as deleteEditorialItemService,
  mapContentToTopics,
} from "./services/editorialService";
import { analyzeContentCrossings } from "./services/contentCrossingService";
import type { EditorialWithMappings } from "./types";

export async function createEditorialItem(data: {
  contestId: string;
  title: string;
  description?: string;
  url?: string;
}): Promise<EditorialWithMappings> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const editorial = await createEditorialItemService(session.user.id, data);

  return {
    ...editorial,
    contest: { id: data.contestId, name: "" },
  };
}

export async function getEditorialsForContest(
  contestId: string,
): Promise<EditorialWithMappings[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const editorials = await getEditorialItems(session.user.id, contestId);

  return editorials.map((e) => ({
    ...e,
    contest: { id: contestId, name: "" },
  }));
}

export async function deleteEditorialItem(editorialId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await deleteEditorialItemService(session.user.id, editorialId);
}

export async function getContentCrossings(contestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return analyzeContentCrossings(contestId, session.user.id);
}

export async function mapContentAction(
  editorialItemId: string,
  mappings: Array<{
    topicId: string;
    contentSummary?: string | null;
    relevance: number;
  }>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return mapContentToTopics(session.user.id, editorialItemId, mappings);
}
