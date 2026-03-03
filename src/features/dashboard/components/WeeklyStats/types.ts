export interface WeeklyStatsProps {
  readonly stats: {
    readonly minutesStudied: number;
    readonly sessionsCompleted: number;
    readonly xpEarned: number;
  };
}
