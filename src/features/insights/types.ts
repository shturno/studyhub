export interface TopicLearningStats {
  userId: string;
  topicId: string;
  totalMinutes: number;
  sessionCount: number;
  avgDifficulty: number | null;
  abandonCount: number;
  lastStudiedAt: Date | null;
}

export interface UserLearningProfile {
  userId: string;
  hourlyDistribution: number[]; // [0..23] — minutes per hour slot
  dailyDistribution: number[]; // [0..6] — minutes per weekday (0=Sun)
  peakHourOfDay: number | null;
  peakDayOfWeek: number | null;
  avgSessionMinutes: number;
  topicsPerWeek: number;
  lastComputedAt: Date;
}

export interface SubjectCorrelation {
  userId: string;
  subjectAId: string;
  subjectBId: string;
  coStudyCount: number;
}

/** Minimal session data passed to the learning engine after a session is saved */
export interface SessionLearningInput {
  userId: string;
  topicId: string;
  subjectId: string;
  minutes: number;
  difficulty: number | null;
  startedAt: Date;
}

/** Compiled profile snapshot fed into AI schedule generation */
export interface LearningContext {
  profile: UserLearningProfile | null;
  hardestTopics: Array<{ topicId: string; avgDifficulty: number; totalMinutes: number }>;
  strongCorrelations: Array<{ subjectAId: string; subjectBId: string; coStudyCount: number }>;
}

/** Weekly tip for dashboard — minimal, non-intrusive */
export interface WeeklyTip {
  key: string; // i18n key suffix e.g. "lowRhythm" | "hardTopic" | "pairedSubjects"
  params: Record<string, string | number>;
}
