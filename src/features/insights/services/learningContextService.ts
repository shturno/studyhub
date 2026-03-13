import { prisma } from "@/lib/prisma";
import type { LearningContext } from "../types";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Fetches the compiled learning profile for use in AI schedule generation.
 * Returns a structured object + a human-readable text summary for the prompt.
 */
export async function getLearningContext(userId: string): Promise<{
  context: LearningContext;
  promptText: string;
}> {
  const [profile, hardestTopics, correlations] = await Promise.all([
    prisma.userLearningProfile.findUnique({ where: { userId } }),

    prisma.topicLearningStats.findMany({
      where: { userId, sessionCount: { gt: 0 } },
      orderBy: { difficultySumFloat: "desc" },
      take: 10,
      include: { topic: { select: { name: true, subject: { select: { name: true } } } } },
    }),

    prisma.subjectCorrelation.findMany({
      where: { userId, coStudyCount: { gte: 3 } },
      orderBy: { coStudyCount: "desc" },
      take: 5,
      include: {
        subjectA: { select: { name: true } },
        subjectB: { select: { name: true } },
      },
    }),
  ]);

  const context: LearningContext = {
    profile: profile
      ? {
          userId: profile.userId,
          hourlyDistribution: profile.hourlyDistribution as number[],
          dailyDistribution: profile.dailyDistribution as number[],
          peakHourOfDay: profile.peakHourOfDay,
          peakDayOfWeek: profile.peakDayOfWeek,
          avgSessionMinutes: profile.avgSessionMinutes,
          topicsPerWeek: profile.topicsPerWeek,
          lastComputedAt: profile.lastComputedAt,
        }
      : null,
    hardestTopics: hardestTopics.map((t) => ({
      topicId: t.topicId,
      avgDifficulty: t.sessionCount > 0 ? t.difficultySumFloat / t.sessionCount : 0,
      totalMinutes: t.totalMinutes,
    })),
    strongCorrelations: correlations.map((c) => ({
      subjectAId: c.subjectAId,
      subjectBId: c.subjectBId,
      coStudyCount: c.coStudyCount,
    })),
  };

  if (!profile && hardestTopics.length === 0) {
    return { context, promptText: "" };
  }

  const lines: string[] = ["## User Learning Profile (from real study history):"];

  if (profile) {
    if (profile.peakHourOfDay !== null) {
      lines.push(`- Peak study hour: ${profile.peakHourOfDay}:00 — schedule hard topics around this time`);
    }
    if (profile.peakDayOfWeek !== null) {
      lines.push(`- Most productive day: ${DAYS[profile.peakDayOfWeek]} — ideal for intensive sessions`);
    }
    if (profile.avgSessionMinutes > 0) {
      lines.push(`- Average session length: ${Math.round(profile.avgSessionMinutes)} min — use this for duration estimates`);
    }
    if (profile.topicsPerWeek > 0) {
      lines.push(`- Real study pace: ~${profile.topicsPerWeek.toFixed(1)} distinct topics/week`);
    }
  }

  if (hardestTopics.length > 0) {
    lines.push("- Topics with highest historical difficulty (schedule these at peak hours, with more review sessions):");
    hardestTopics.slice(0, 5).forEach((t) => {
      const topicData = (t as typeof t & { topic?: { name: string; subject?: { name: string } } }).topic;
      const name = topicData ? `${topicData.subject?.name ?? ""} > ${topicData.name}` : t.topicId;
      lines.push(`  • ${name} (avg difficulty: ${(t.difficultySumFloat / Math.max(t.sessionCount, 1)).toFixed(1)}/5, ${t.totalMinutes} min studied)`);
    });
  }

  if (correlations.length > 0) {
    lines.push("- Subject pairs the user studies well together (consider co-scheduling on the same day):");
    correlations.forEach((c) => {
      const nameA = (c as typeof c & { subjectA?: { name: string } }).subjectA?.name ?? c.subjectAId;
      const nameB = (c as typeof c & { subjectB?: { name: string } }).subjectB?.name ?? c.subjectBId;
      lines.push(`  • ${nameA} + ${nameB} (studied together ${c.coStudyCount} days)`);
    });
  }

  return { context, promptText: lines.join("\n") };
}

/**
 * Returns a suggested duration (in minutes) for a topic based on learning history.
 * Falls back to user avg → 25min pomodoro default.
 */
export async function getTopicDurationSuggestion(
  userId: string,
  topicId: string,
): Promise<number> {
  const [topicStats, profile] = await Promise.all([
    prisma.topicLearningStats.findUnique({
      where: { userId_topicId: { userId, topicId } },
      select: { totalMinutes: true, sessionCount: true },
    }),
    prisma.userLearningProfile.findUnique({
      where: { userId },
      select: { avgSessionMinutes: true },
    }),
  ]);

  if (topicStats && topicStats.sessionCount > 0) {
    return Math.round(topicStats.totalMinutes / topicStats.sessionCount);
  }

  if (profile && profile.avgSessionMinutes > 0) {
    return Math.round(profile.avgSessionMinutes);
  }

  return 25; // pomodoro default
}
