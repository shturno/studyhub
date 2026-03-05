import { type StudyAreaPriority } from "@/features/editorials/types";

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface ScheduleRequest {
  contestName: string;
  priorities: StudyAreaPriority[];
  weeklyAvailableHours: number;
  dailyAvailableHours: Record<DayKey, number>;
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
