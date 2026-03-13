import type { StudyAreaPriority } from "@/features/editorials/types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface TopicForSchedule {
  id: string;
  name: string;
  studiedMinutes: number;
}

export interface SubjectForSchedule {
  id: string;
  name: string;
  weight: number; // 1-10
  userLevel: number; // 1-10
  topics: TopicForSchedule[];
}

export interface ContestForSchedule {
  id: string;
  name: string;
  examDate: Date | null;
  manualPriority: number; // 0-5
  subjects: SubjectForSchedule[];
}

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

export interface MultiContestTopicPriority extends StudyAreaPriority {
  contestId: string;
  contestName: string;
  allocatedWeeklyMinutes: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Estimated study minutes needed for a fresh topic */
const ESTIMATED_MINUTES_PER_TOPIC = 30;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function computeContestUrgency(contest: ContestForSchedule): number {
  const priorityBoost = 1 + contest.manualPriority / 5; // 1.0–2.0×

  if (!contest.examDate) {
    // No exam date → treat as low urgency but still include
    return 0.1 * priorityBoost;
  }

  const now = new Date();
  const daysUntilExam = Math.max(
    (contest.examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    1,
  );

  // Urgency = 100 / days (closer exam → higher urgency)
  const urgency = 100 / daysUntilExam;
  return urgency * priorityBoost;
}

function computeSubjectScore(subject: SubjectForSchedule): number {
  const totalTopics = subject.topics.length;
  if (totalTopics === 0) return 0;

  const totalStudied = subject.topics.reduce(
    (sum, t) => sum + t.studiedMinutes,
    0,
  );
  const estimated = totalTopics * ESTIMATED_MINUTES_PER_TOPIC;
  const progressRatio = Math.min(totalStudied / estimated, 1);

  // Higher weight × lower level × less progress → higher score
  const levelFactor = 1 / Math.max(subject.userLevel, 1);
  return subject.weight * levelFactor * (1 - progressRatio * 0.7);
}

function computeTopicScore(topic: TopicForSchedule): number {
  const progressRatio = Math.min(
    topic.studiedMinutes / ESTIMATED_MINUTES_PER_TOPIC,
    1,
  );
  // Minimum 0.1 so fully-studied topics still receive a little maintenance time
  return Math.max(1 - progressRatio, 0.1);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Distributes `totalWeeklyHours` across all topics from all contests,
 * weighted by exam proximity, manual priority, subject weight/level, and
 * individual topic progress.
 */
export function computeMultiContestPriorities(
  contests: ContestForSchedule[],
  totalWeeklyHours: number,
): MultiContestTopicPriority[] {
  if (contests.length === 0) return [];

  // Exclude contests whose exam date has already passed — no point studying for them.
  const now = new Date();
  const activeContests = contests.filter(
    (c) => !c.examDate || c.examDate.getTime() > now.getTime(),
  );
  // Fall back to all contests if every single one is in the past (edge case)
  const effectiveContests = activeContests.length > 0 ? activeContests : contests;

  const totalWeeklyMinutes = totalWeeklyHours * 60;

  // 1 — Contest-level shares
  const contestUrgencies = effectiveContests.map((c) => computeContestUrgency(c));
  const totalUrgency = contestUrgencies.reduce((s, u) => s + u, 0) || 1;

  const rawEntries: MultiContestTopicPriority[] = [];

  for (let ci = 0; ci < effectiveContests.length; ci++) {
    const contest = effectiveContests[ci];
    const contestMinutes =
      totalWeeklyMinutes * (contestUrgencies[ci] / totalUrgency);

    const subjects = contest.subjects.filter((s) => s.topics.length > 0);
    if (subjects.length === 0) continue;

    // 2 — Subject-level shares within the contest
    const subjectScores = subjects.map((s) => computeSubjectScore(s));
    const totalSubjectScore = subjectScores.reduce((s, v) => s + v, 0) || 1;

    for (let si = 0; si < subjects.length; si++) {
      const subject = subjects[si];
      const subjectMinutes =
        contestMinutes * (subjectScores[si] / totalSubjectScore);

      // 3 — Topic-level shares within the subject
      const topicScores = subject.topics.map((t) => computeTopicScore(t));
      const totalTopicScore = topicScores.reduce((s, v) => s + v, 0) || 1;

      for (let ti = 0; ti < subject.topics.length; ti++) {
        const topic = subject.topics[ti];
        const topicMinutes =
          subjectMinutes * (topicScores[ti] / totalTopicScore);

        const coveragePercent = Math.round(
          Math.min(topic.studiedMinutes / ESTIMATED_MINUTES_PER_TOPIC, 1) * 100,
        );

        rawEntries.push({
          topicId: topic.id,
          topicName: topic.name,
          subjectId: subject.id,
          subjectName: subject.name,
          contestId: contest.id,
          contestName: contest.name,
          allocatedWeeklyMinutes: Math.round(topicMinutes),
          recommendedHours: parseFloat((topicMinutes / 60).toFixed(2)),
          priority: "medium", // set below
          reason: "",
          coveragePercent,
        });
      }
    }
  }

  if (rawEntries.length === 0) return [];

  // 4 — Classify priorities (top 30% = high, next 40% = medium, rest = low)
  rawEntries.sort((a, b) => b.allocatedWeeklyMinutes - a.allocatedWeeklyMinutes);

  const highCutoff = Math.ceil(rawEntries.length * 0.3);
  const mediumCutoff = highCutoff + Math.ceil(rawEntries.length * 0.4);

  return rawEntries.map((entry, idx) => {
    const priority: "high" | "medium" | "low" =
      idx < highCutoff ? "high" : idx < mediumCutoff ? "medium" : "low";

    return {
      ...entry,
      priority,
      reason: buildReason(entry, priority, contests),
    };
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildReason(
  entry: MultiContestTopicPriority,
  priority: "high" | "medium" | "low",
  contests: ContestForSchedule[],
): string {
  const contest = contests.find((c) => c.id === entry.contestId);
  const parts: string[] = [];

  if (contest?.examDate) {
    const days = Math.max(
      Math.ceil(
        (contest.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
      0,
    );
    parts.push(days <= 0 ? "Prova hoje!" : `Prova em ${days} dia${days === 1 ? "" : "s"}`);
  }

  if (priority === "high") parts.push("Alta prioridade");
  if ((entry.coveragePercent ?? 0) < 20) parts.push("Pouco estudado");
  if (entry.allocatedWeeklyMinutes > 0) {
    parts.push(`${entry.allocatedWeeklyMinutes} min/semana`);
  }

  return parts.join(" · ") || "Incluído no cronograma";
}
