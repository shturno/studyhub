import { prisma } from "@/lib/prisma";

export interface EditorialItemInput {
  contestId: string;
  title: string;
  description?: string;
  url?: string;
}

export interface EditorialItemWithMappings {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  uploadedAt: Date;
  contentMappings: Array<{
    topicId: string;
    contentSummary?: string | null;
    relevance: number;
    topic: {
      id: string;
      name: string;
      subject: {
        id: string;
        name: string;
      };
    };
  }>;
}

export async function createEditorialItem(
  userId: string,
  input: EditorialItemInput,
): Promise<EditorialItemWithMappings> {
  const editorialItem = await prisma.editorialItem.create({
    data: {
      userId,
      contestId: input.contestId,
      title: input.title,
      description: input.description,
      url: input.url,
    },
    include: {
      contentMappings: {
        include: {
          topic: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return editorialItem;
}

export async function getEditorialItems(
  userId: string,
  contestId: string,
): Promise<EditorialItemWithMappings[]> {
  const items = await prisma.editorialItem.findMany({
    where: {
      contestId,
      userId,
    },
    include: {
      contentMappings: {
        include: {
          topic: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  return items;
}

export async function deleteEditorialItem(
  userId: string,
  editorialItemId: string,
): Promise<void> {
  const item = await prisma.editorialItem.findUnique({
    where: { id: editorialItemId },
    select: { userId: true },
  });

  if (item?.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.editorialItem.delete({
    where: { id: editorialItemId },
  });
}

export async function mapContentToTopics(
  userId: string,
  editorialItemId: string,
  mappings: Array<{
    topicId: string;
    contentSummary?: string | null;
    relevance: number;
  }>,
): Promise<void> {
  const item = await prisma.editorialItem.findUnique({
    where: { id: editorialItemId },
    select: { userId: true },
  });

  if (item?.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.contentMapping.deleteMany({
    where: { editorialItemId },
  });

  for (const mapping of mappings) {
    await prisma.contentMapping.create({
      data: {
        editorialItemId,
        topicId: mapping.topicId,
        contentSummary: mapping.contentSummary,
        relevance: Math.max(0, Math.min(100, mapping.relevance)),
      },
    });
  }
}

export async function getContentMappingsBetweenEditorials(
  editorialId1: string,
  editorialId2: string,
): Promise<
  Array<{
    topic: { id: string; name: string };
    editorial1Relevance: number;
    editorial2Relevance: number;
  }>
> {
  const mappings1 = await prisma.contentMapping.findMany({
    where: { editorialItemId: editorialId1 },
    select: { topicId: true, relevance: true },
  });

  const mappings2 = await prisma.contentMapping.findMany({
    where: { editorialItemId: editorialId2 },
    select: { topicId: true, relevance: true },
  });

  const topicIds1 = new Set(mappings1.map((m) => m.topicId));
  const relevanceMap1 = new Map(mappings1.map((m) => [m.topicId, m.relevance]));

  const crossings = mappings2
    .filter((m) => topicIds1.has(m.topicId))
    .map((m) => ({
      topicId: m.topicId,
      editorial1Relevance: relevanceMap1.get(m.topicId) || 0,
      editorial2Relevance: m.relevance,
    }));

  if (crossings.length === 0) return [];

  const topics = await prisma.topic.findMany({
    where: {
      id: { in: crossings.map((c) => c.topicId) },
    },
    select: { id: true, name: true },
  });

  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return crossings
    .filter((c) => topicMap.has(c.topicId))
    .map((c) => ({
      topic: topicMap.get(c.topicId)!,
      editorial1Relevance: c.editorial1Relevance,
      editorial2Relevance: c.editorial2Relevance,
    }));
}
