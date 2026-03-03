export interface StatsData {
  readonly totalHours: number;
  readonly totalSessions: number;
  readonly currentWeekHours: number;
  readonly trackDistribution: Array<{
    readonly name: string;
    readonly hours: number;
  }>;
}
