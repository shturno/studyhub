export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    xp: number;
    level: number;
  };
  nextTopic: {
    id: string;
    name: string;
    subjectName: string;
    estimatedMinutes: number;
  } | null;
  weeklyStats: {
    minutesStudied: number;
    sessionsCompleted: number;
    xpEarned: number;
  };
  recentSessions: Array<{
    id: string;
    topicName: string;
    minutes: number;
    xpEarned: number;
    completedAt: Date;
  }>;
  aiRecommendations: string[];
  coveragePercent: number;
}

export interface WeeklyData {
  readonly week: string;
  readonly hours: number;
}

export interface TrackData {
  readonly name: string;
  readonly hours: number;
  readonly minutes: number;
}

export interface StatsData {
  readonly weeklyStats: WeeklyData[];
  readonly trackDistribution: TrackData[];
}

export interface DashboardViewProps {
  readonly data: DashboardData;
}
