'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditorialItem, ContentMapping, EditorialWithMappings } from './types'

export async function createEditorialItem(data: {
  contestId: string
  title: string
  description?: string
  url?: string
}): Promise<EditorialItem> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const editorial = await prisma.editorialItem.create({
    data: {
      userId: session.user.id,
      contestId: data.contestId,
      title: data.title,
      description: data.description,
      url: data.url,
    },
  })

  return editorial
}

export async function getEditorialsForContest(contestId: string): Promise<EditorialWithMappings[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const editorials = await prisma.editorialItem.findMany({
    where: {
      contestId,
      userId: session.user.id,
    },
    include: {
      contentMappings: true,
      contest: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  })

  return editorials as EditorialWithMappings[]
}

export async function deleteEditorialItem(editorialId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verify ownership
  const editorial = await prisma.editorialItem.findUnique({
    where: { id: editorialId },
  })

  if (!editorial?.userId || editorial.userId !== session.user.id) {
    throw new Error('Unauthorized or editorial not found')
  }

  await prisma.editorialItem.delete({
    where: { id: editorialId },
  })
}

export async function createContentMapping(data: {
  editorialItemId: string
  topicId: string
  contentSummary?: string
  relevance?: number
}): Promise<ContentMapping> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verify the editorial belongs to the user
  const editorial = await prisma.editorialItem.findUnique({
    where: { id: data.editorialItemId },
  })

  if (!editorial?.userId || editorial.userId !== session.user.id) {
    throw new Error('Unauthorized')
  }

  const mapping = await prisma.contentMapping.create({
    data: {
      editorialItemId: data.editorialItemId,
      topicId: data.topicId,
      contentSummary: data.contentSummary,
      relevance: data.relevance ?? 50,
    },
  })

  return mapping
}

export async function deleteContentMapping(mappingId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const mapping = await prisma.contentMapping.findUnique({
    where: { id: mappingId },
    include: {
      editorialItem: true,
    },
  })

  if (!mapping?.editorialItem?.userId || mapping.editorialItem.userId !== session.user.id) {
    throw new Error('Unauthorized')
  }

  await prisma.contentMapping.delete({
    where: { id: mappingId },
  })
}

export async function getContentCrossings(contestId: string): Promise<{
  topicId: string
  topicName: string
  mappingCount: number
  editorialCount: number
  relevanceScore: number
}[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Get all content mappings for editorials in this contest
  const mappings = await prisma.contentMapping.findMany({
    where: {
      editorialItem: {
        contestId,
        userId: session.user.id,
      },
    },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Group by topic and calculate statistics
  interface TopicEntry { topicId: string; topicName: string; mappingCount: number; editorialCount: Set<string>; totalRelevance: number }
  const topicMap = new Map<string, TopicEntry>()

  for (const mapping of mappings) {
    const key = mapping.topicId
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        topicId: mapping.topic.id,
        topicName: mapping.topic.name,
        mappingCount: 0,
        editorialCount: new Set<string>(),
        totalRelevance: 0,
      })
    }

    const entry = topicMap.get(key)
    if (entry) {
      entry.mappingCount++
      entry.editorialCount.add(mapping.editorialItemId)
      entry.totalRelevance += mapping.relevance
    }
  }

  // Format the response
  const result = Array.from(topicMap.values()).map((entry) => ({
    topicId: entry.topicId,
    topicName: entry.topicName,
    mappingCount: entry.mappingCount,
    editorialCount: entry.editorialCount.size,
    relevanceScore: Math.round(entry.totalRelevance / entry.mappingCount),
  }))

  return result.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

import { mapContentToTopics } from './services/editorialService'

export async function mapContentAction(
  editorialItemId: string,
  mappings: Array<{ topicId: string; contentSummary?: string | null; relevance: number }>
) {
  return mapContentToTopics(editorialItemId, mappings)
}
