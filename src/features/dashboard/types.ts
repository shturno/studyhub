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
}
