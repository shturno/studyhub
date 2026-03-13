import type { DailyMissionSummary } from "@/features/gamification/services/missionService";
import type { WeeklyTip } from "@/features/insights/types";
import type { DailyObligationSummary } from "@/features/gamification/services/dailyObligationService";
import type { ActivityEventSummary } from "@/features/gamification/services/activityEventService";

export type { DailyMissionSummary, DailyObligationSummary, ActivityEventSummary };

export interface HeatmapDay {
  date: string;
  count: number;
  minutes: number;
}

export interface TodayPlannedSession {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  durationMinutes: number;
  completed: boolean;
}

export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    xp: number;
    level: number;
  };
  statsData: StatsData;
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
  coveragePercent: number;
  contestName: string;
  contestId: string | null;
  priorities: Array<{
    topicId: string;
    topicName: string;
    priority: "high";
    reason: string;
    recommendedHours: number;
  }>;
  heatmap: HeatmapDay[];
  streak: number;
  xpProgress: number;
  xpToNextLevel: number;
  dailyGoal: {
    targetMinutes: number;
    studiedTodayMinutes: number;
  };
  weeklyComparison: {
    thisWeekMinutes: number;
    lastWeekMinutes: number;
    deltaPercent: number;
    personalBestMinutes: number;
    last4Weeks: Array<{ weekLabel: string; minutes: number }>;
    isPersonalBest: boolean;
  };
  missions: DailyMissionSummary[];
  weeklyTip: WeeklyTip | null;
  dailyObligation: DailyObligationSummary | null;
  activityFeed: ActivityEventSummary[];
  todayPlanned: TodayPlannedSession[];
  pendingPenalties: {
    totalPenalty: number;
    missedDays: Array<{ date: string; topicName: string; xpPenalty: number; aiReasoning: string | null }>;
  };
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
