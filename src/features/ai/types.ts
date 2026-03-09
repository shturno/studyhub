import { type StudyAreaPriority } from "@/features/editorials/types";

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface ContestScheduleInfo {
  id: string;
  name: string;
  examDate: Date | null;
}

export interface ScheduleRequest {
  /** List of all contests included in this schedule */
  contestsInfo: ContestScheduleInfo[];
  priorities: StudyAreaPriority[];
  weeklyAvailableHours: number;
  dailyAvailableHours: Record<DayKey, number>;
  /** Earliest exam date (drives chunk generation end date) */
  examDate: Date;
  focusAreas?: string[];
}

export interface GeneratedScheduleSession {
  day: string;
  timeSlot: string;
  topics: string[];
  duration: number;
  focus: string;
  reason: string;
}

export interface WeeklyScheduleSummary {
  week: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  topics: string[];
  focus: string;
  keyActivities: string[];
}

export interface MonthlyScheduleSummary {
  month: string;
  totalHours: number;
  topics: string[];
  weeklyBreakdown: {
    week: number;
    hours: number;
    focus: string;
  }[];
  milestones: string[];
}

export interface GeneratedSchedule {
  weeks: number;
  totalHours: number;
  dailySessions: GeneratedScheduleSession[];
  weeklySummary: WeeklyScheduleSummary[];
  monthlySummary: MonthlyScheduleSummary[];
  fullScheduleOverview: {
    totalDaysOfStudy: number;
    averageDailyHours: number;
    peakIntensityWeek: number;
    topicsCoverage: {
      topic: string;
      sessions: number;
      totalHours: number;
      priority: "high" | "medium" | "low";
    }[];
  };
  keyMilestones: string[];
  tips: string[];
}
