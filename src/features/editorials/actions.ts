"use server";

import { auth } from "@/lib/auth";
import { ok, err, type ActionResult } from "@/lib/result";
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
}): Promise<ActionResult<EditorialWithMappings>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const editorial = await createEditorialItemService(session.user.id, data);

    return ok({
      ...editorial,
      contest: { id: data.contestId, name: "" },
    });
  } catch (error) {
    console.error("createEditorialItem error:", error);
    return err("Erro ao criar edital");
  }
}

export async function getEditorialsForContest(
  contestId: string,
): Promise<ActionResult<EditorialWithMappings[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const editorials = await getEditorialItems(session.user.id, contestId);

    return ok(
      editorials.map((e) => ({
        ...e,
        contest: { id: contestId, name: "" },
      })),
    );
  } catch (error) {
    console.error("getEditorialsForContest error:", error);
    return err("Erro ao carregar editais");
  }
}

export async function deleteEditorialItem(
  editorialId: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await deleteEditorialItemService(session.user.id, editorialId);
    return ok(undefined);
  } catch (error) {
    console.error("deleteEditorialItem error:", error);
    return err("Erro ao deletar edital");
  }
}

export async function getContentCrossings(
  contestId: string,
): Promise<
  ActionResult<
    Array<{
      topicId: string;
      topicName: string;
      editorialsCount: number;
      mappingsCount: number;
      averageRelevance: number;
      editorialTitles: string[];
    }>
  >
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const crossings = await analyzeContentCrossings(contestId, session.user.id);
    return ok(crossings);
  } catch (error) {
    console.error("getContentCrossings error:", error);
    return err("Erro ao carregar cruzamentos");
  }
}

export async function mapContentAction(
  editorialItemId: string,
  mappings: Array<{
    topicId: string;
    contentSummary?: string | null;
    relevance: number;
  }>,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    await mapContentToTopics(session.user.id, editorialItemId, mappings);
    return ok(undefined);
  } catch (error) {
    console.error("mapContentAction error:", error);
    return err("Erro ao mapear conteúdo");
  }
}
