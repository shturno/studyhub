import { prisma } from "@/lib/prisma";
import { type StudyAreaPriority } from "@/features/editorials/types";

interface PriorityTopicEntry {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  editorials: Set<string>;
  relevances: number[];
}

/**
 * Generate study priorities for topics based on content mappings and frequency
 */
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
