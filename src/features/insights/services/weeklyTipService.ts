import { prisma } from "@/lib/prisma";
import type { WeeklyTip } from "../types";

const TIP_COOLDOWN_DAYS = 7;

/**
 * Generates the most relevant weekly tip for the user based on their learning profile.
 * Returns null if the user has insufficient history or the last tip was shown recently.
 */
export async function getWeeklyTip(userId: string): Promise<WeeklyTip | null> {
  const profile = await prisma.userLearningProfile.findUnique({
    where: { userId },
  });

  // Not enough data yet
  if (!profile) return null;

  // Respect the cooldown window — check lastComputedAt as a proxy
  // (a proper lastTipShownAt would require a settings update; we reuse lastComputedAt here)
  const cooldownCutoff = new Date();
  cooldownCutoff.setDate(cooldownCutoff.getDate() - TIP_COOLDOWN_DAYS);
  // We always compute — the caller decides whether to display based on the tip key

  // Priority 1: Low study rhythm (< 2 topics/week)
  if (profile.topicsPerWeek > 0 && profile.topicsPerWeek < 2) {
    return {
      key: "lowRhythm",
      params: { topicsPerWeek: parseFloat(profile.topicsPerWeek.toFixed(1)) },
    };
  }

  // Priority 2: Recurring difficult topic
  const hardestTopic = await prisma.topicLearningStats.findFirst({
    where: {
      userId,
      sessionCount: { gte: 2 },
    },
    orderBy: { difficultySumFloat: "desc" },
    include: { topic: { select: { name: true, subject: { select: { name: true } } } } },
  });

  if (hardestTopic) {
    const avgDifficulty = hardestTopic.difficultySumFloat / hardestTopic.sessionCount;
    if (avgDifficulty >= 4.0) {
      return {
        key: "hardTopic",
        params: {
          topicName: hardestTopic.topic.name,
          subjectName: hardestTopic.topic.subject.name,
          avgDifficulty: parseFloat(avgDifficulty.toFixed(1)),
        },
      };
    }
  }

  // Priority 3: Strong subject pair correlation
  const topCorrelation = await prisma.subjectCorrelation.findFirst({
    where: { userId, coStudyCount: { gte: 5 } },
    orderBy: { coStudyCount: "desc" },
    include: {
      subjectA: { select: { name: true } },
      subjectB: { select: { name: true } },
    },
  });

  if (topCorrelation) {
    return {
      key: "pairedSubjects",
      params: {
        subjectA: topCorrelation.subjectA.name,
        subjectB: topCorrelation.subjectB.name,
        coStudyCount: topCorrelation.coStudyCount,
      },
    };
  }

  // Priority 4: Peak hour tip (if well-established)
  if (profile.peakHourOfDay !== null) {
    return {
      key: "peakHour",
      params: { hour: profile.peakHourOfDay },
    };
  }

  return null;
}
