import { prisma } from "@/lib/prisma";
import { type ContentOverlap, type StudyAreaPriority } from "@/features/editorials/types";

interface MappingsByTopic {
  topicId: string;
  topicName: string;
  editorials: Map<string, string>;
  relevances: number[];
}

interface PriorityTopicEntry {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  editorials: Set<string>;
  relevances: number[];
}

async function groupMappingsByTopic(
  contestId: string,
  userId: string,
): Promise<Map<string, MappingsByTopic>> {
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
  });

  const topicMap = new Map<string, MappingsByTopic>();

  for (const mapping of contentMappings) {
    const key = mapping.topicId;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        topicId: mapping.topic.id,
        topicName: mapping.topic.name,
        editorials: new Map<string, string>(),
        relevances: [],
      });
    }

    const entry = topicMap.get(key)!;
    entry.editorials.set(
      mapping.editorialItem.id,
      mapping.editorialItem.title,
    );
    entry.relevances.push(mapping.relevance);
  }

  return topicMap;
}

export async function analyzeContentCrossings(
  contestId: string,
  userId: string,
): Promise<ContentOverlap[]> {
  const topicMap = await groupMappingsByTopic(contestId, userId);

  const results: ContentOverlap[] = Array.from(topicMap.values()).map(
    (entry) => ({
      topicId: entry.topicId,
      topicName: entry.topicName,
      editorialsCount: entry.editorials.size,
      mappingsCount: entry.relevances.length,
      averageRelevance: Math.round(
        entry.relevances.reduce((a: number, b: number) => a + b, 0) /
          entry.relevances.length,
      ),
      editorialTitles: Array.from(entry.editorials.values()),
    }),
  );

  return results.sort(
    (a, b) =>
      b.editorialsCount - a.editorialsCount ||
      b.averageRelevance - a.averageRelevance,
  );
}

export async function generateStudyPriorities(
  contestId: string,
  userId: string,
  weeklyHours: number = 40,
): Promise<StudyAreaPriority[]> {
  const contentMappings = await prisma.contentMapping.findMany({
    where: {
      editorialItem: {
        contestId,
        userId,
      },
    },
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
      editorialItem: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (contentMappings.length === 0) {
    return [];
  }

  const topicMap = new Map<string, PriorityTopicEntry>();

  for (const mapping of contentMappings) {
    const key = mapping.topicId;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        topicId: mapping.topic.id,
        topicName: mapping.topic.name,
        subjectId: mapping.topic.subject.id,
        subjectName: mapping.topic.subject.name,
        editorials: new Set<string>(),
        relevances: [],
      });
    }

    const entry = topicMap.get(key)!;
    entry.editorials.add(mapping.editorialItem.id);
    entry.relevances.push(mapping.relevance);
  }

  const sortedTopics = Array.from(topicMap.values())
    .map((entry) => ({
      ...entry,
      editorialCount: entry.editorials.size,
      averageRelevance: Math.round(
        entry.relevances.reduce((a: number, b: number) => a + b, 0) /
          entry.relevances.length,
      ),
    }))
    .sort((a, b) => {
      if (b.editorialCount !== a.editorialCount)
        return b.editorialCount - a.editorialCount;
      return b.averageRelevance - a.averageRelevance;
    });

  const priorities: StudyAreaPriority[] = [];
  const totalTopics = sortedTopics.length;

  for (let i = 0; i < sortedTopics.length; i++) {
    const topic = sortedTopics[i];
    const percentile = (i + 1) / totalTopics;

    let priority: "high" | "medium" | "low";
    let hoursMultiplier: number;

    if (percentile <= 0.25) {
      priority = "high";
      hoursMultiplier = 0.4;
    } else if (percentile <= 0.65) {
      priority = "medium";
      hoursMultiplier = 0.25;
    } else {
      priority = "low";
      hoursMultiplier = 0.1;
    }

    const reason =
      topic.editorialCount > 1
        ? `Presente em ${topic.editorialCount} editais (${topic.averageRelevance}% relevância)`
        : `Alta relevância (${topic.averageRelevance}% relevância)`;

    priorities.push({
      topicId: topic.topicId,
      topicName: topic.topicName,
      subjectId: topic.subjectId,
      subjectName: topic.subjectName,
      priority,
      reason,
      recommendedHours: Math.round(weeklyHours * hoursMultiplier),
      coveragePercent: topic.averageRelevance,
    });
  }

  return priorities;
}

export async function identifyContentGaps(
  contestId: string,
  userId: string,
): Promise<
  {
    topicId: string;
    topicName: string;
    subjectName: string;
  }[]
> {
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
  });

  const gaps = allTopics
    .filter((topic) => topic.contentMappings.length === 0)
    .map((topic) => ({
      topicId: topic.id,
      topicName: topic.name,
      subjectName: topic.subject.name,
    }));

  return gaps.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

export async function calculateCoveragePercentage(
  contestId: string,
  userId: string,
): Promise<{
  coverage: number;
  totalTopics: number;
  coveredTopics: number;
  gaps: number;
}> {
  const allTopics = await prisma.topic.findMany({
    where: {
      subject: {
        contestId,
      },
    },
  });

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
  });

  const totalTopics = allTopics.length;
  const covered = coveredTopics.length;
  const coverage =
    totalTopics > 0 ? Math.round((covered / totalTopics) * 100) : 0;

  return {
    coverage,
    totalTopics,
    coveredTopics: covered,
    gaps: totalTopics - covered,
  };
}
