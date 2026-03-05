import { prisma } from "@/lib/prisma";
import { type ContentOverlap } from "@/features/editorials/types";

interface MappingsByTopic {
  topicId: string;
  topicName: string;
  editorials: Map<string, string>;
  relevances: number[];
}

/**
 * Group content mappings by topic
 */
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
    entry.editorials.set(mapping.editorialItem.id, mapping.editorialItem.title);
    entry.relevances.push(mapping.relevance);
  }

  return topicMap;
}

/**
 * Analyze which topics appear in multiple editorials (content overlaps)
 */
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

// Re-export functions from separated services for backward compatibility
export { generateStudyPriorities } from "./priorityService";
export { identifyContentGaps, calculateCoveragePercentage } from "./coverageService";
