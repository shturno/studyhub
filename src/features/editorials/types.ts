export interface EditorialItem {
  id: string;
  userId: string;
  contestId: string;
  title: string;
  description?: string | null;
  url?: string | null;
  uploadedAt: Date;
  contentMappings?: ContentMapping[];
}

export interface ContentMapping {
  id: string;
  editorialItemId: string;
  topicId: string;
  contentSummary?: string | null;
  relevance: number;
}

export interface EditorialWithMappings extends EditorialItem {
  contentMappings: ContentMapping[];
  contest: {
    id: string;
    name: string;
  };
}

export interface ContentOverlap {
  topicId: string;
  topicName: string;
  editorialsCount: number;
  mappingsCount: number;
  averageRelevance: number;
  editorialTitles: string[];
}

export interface StudyAreaPriority {
  topicId: string;
  topicName: string;
  subjectId?: string;
  subjectName?: string;
  priority: "high" | "medium" | "low";
  reason: string;
  recommendedHours: number;
  coveragePercent?: number;
}

export type {
  GeneratedScheduleSession,
  WeeklyScheduleSummary,
  MonthlyScheduleSummary,
  GeneratedSchedule,
} from "@/features/ai/types";
