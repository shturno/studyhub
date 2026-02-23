import { prisma } from '@/lib/prisma'

export interface ContentOverlap {
  topicId: string
  topicName: string
  editorialsCount: number
  mappingsCount: number
  averageRelevance: number
  editorialTitles: string[]
}

export interface StudyAreaPriority {
  topicId: string
  topicName: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  recommendedHours: number
}

/**
 * Analyze content crossings between multiple editorials
 * Identifies topics that appear in multiple editorials (high priority)
 */
export async function analyzeContentCrossings(
  contestId: string,
  userId: string
): Promise<ContentOverlap[]> {
  const contentMappings = await prisma.contentMapping.findMany({
    where: {
      editorialItem: {
        contestId,
        userId,
      },
    },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
      editorialItem: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  // Group by topic
  const topicMap = new Map<string, any>()

  for (const mapping of contentMappings) {
    const key = mapping.topicId
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        topicId: mapping.topic.id,
        topicName: mapping.topic.name,
        editorials: new Map<string, string>(),
        relevances: [],
      })
    }

    const entry = topicMap.get(key)
    entry.editorials.set(mapping.editorialItem.id, mapping.editorialItem.title)
    entry.relevances.push(mapping.relevance)
  }

  // Build results with statistics
  const results: ContentOverlap[] = Array.from(topicMap.values()).map((entry) => ({
    topicId: entry.topicId,
    topicName: entry.topicName,
    editorialsCount: entry.editorials.size,
    mappingsCount: entry.relevances.length,
    averageRelevance: Math.round(
      entry.relevances.reduce((a: number, b: number) => a + b, 0) / entry.relevances.length
    ),
    editorialTitles: Array.from(entry.editorials.values()),
  }))

  // Sort by number of editorials (more is better), then by relevance
  return results.sort(
    (a, b) =>
      b.editorialsCount - a.editorialsCount ||
      b.averageRelevance - a.averageRelevance
  )
}

/**
 * Generate study priorities based on content crossings
 */
export async function generateStudyPriorities(
  contestId: string,
  userId: string,
  weeklyHours: number = 40
): Promise<StudyAreaPriority[]> {
  const crossings = await analyzeContentCrossings(contestId, userId)

  if (crossings.length === 0) {
    return []
  }

  const totalCrossings = crossings.reduce((sum, c) => sum + c.editorialsCount, 0)
  const priorities: StudyAreaPriority[] = []

  for (const crossing of crossings) {
    let priority: 'high' | 'medium' | 'low'
    let reason: string
    let hoursMultiplier: number

    if (crossing.editorialsCount >= Math.ceil(totalCrossings * 0.5)) {
      // Appears in many editorials
      priority = 'high'
      reason = `Presente em ${crossing.editorialsCount} editais (alta relevância)`
      hoursMultiplier = 0.4
    } else if (crossing.editorialsCount >= 2) {
      priority = 'medium'
      reason = `Presente em ${crossing.editorialsCount} editais`
      hoursMultiplier = 0.25
    } else {
      priority = 'low'
      reason = 'Tópico específico de um edital'
      hoursMultiplier = 0.1
    }

    priorities.push({
      topicId: crossing.topicId,
      topicName: crossing.topicName,
      priority,
      reason,
      recommendedHours: Math.round(weeklyHours * hoursMultiplier),
    })
  }

  return priorities
}

/**
 * Identify topics not covered by any edital (potential gaps)
 */
export async function identifyContentGaps(
  contestId: string,
  userId: string
): Promise<{
  topicId: string
  topicName: string
  subjectName: string
}[]> {
  // Get all topics in the contest
  const allTopics = await prisma.topic.findMany({
    where: {
      subject: {
        contestId,
      },
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
      contentMappings: {
        where: {
          editorialItem: {
            userId,
          },
        },
      },
    },
  })

  // Find topics without any mappings
  const gaps = allTopics
    .filter((topic) => topic.contentMappings.length === 0)
    .map((topic) => ({
      topicId: topic.id,
      topicName: topic.name,
      subjectName: topic.subject.name,
    }))

  return gaps.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
}

/**
 * Calculate overall coverage percentage for contest editorials
 */
export async function calculateCoveragePercentage(
  contestId: string,
  userId: string
): Promise<{
  coverage: number
  totalTopics: number
  coveredTopics: number
  gaps: number
}> {
  const allTopics = await prisma.topic.findMany({
    where: {
      subject: {
        contestId,
      },
    },
  })

  const coveredTopics = await prisma.topic.findMany({
    where: {
      subject: {
        contestId,
      },
      contentMappings: {
        some: {
          editorialItem: {
            userId,
          },
        },
      },
    },
  })

  const totalTopics = allTopics.length
  const covered = coveredTopics.length
  const coverage = totalTopics > 0 ? Math.round((covered / totalTopics) * 100) : 0

  return {
    coverage,
    totalTopics,
    coveredTopics: covered,
    gaps: totalTopics - covered,
  }
}
