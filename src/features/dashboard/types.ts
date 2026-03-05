export interface HeatmapDay {
  date: string;    // 'YYYY-MM-DD'
  count: number;   // número de sessões no dia
  minutes: number; // minutos totais no dia
}

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
  heatmap: HeatmapDay[];
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
