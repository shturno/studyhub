import { prisma } from "@/lib/prisma";

/**
 * Identify topics that have no content mappings (coverage gaps)
 */
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

/**
 * Calculate coverage percentage and statistics
 */
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
