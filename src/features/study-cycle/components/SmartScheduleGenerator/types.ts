import type { GeneratedSchedule, DayKey } from "@/features/ai/types";
import type { StudyAreaPriority } from "@/features/editorials/types";
import type { ContestSummary } from "@/features/study-cycle/types";

export type { ContestSummary };

export interface SmartScheduleGeneratorProps {
  readonly contests: ContestSummary[];
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export type DayHours = Record<DayKey, number>;

export interface ScheduleContest {
  readonly id: string;
  readonly name: string;
  readonly examDate: string | null;
}

export interface ScheduleData {
  readonly schedule: GeneratedSchedule;
  readonly priorities: StudyAreaPriority[];
  readonly contests: ScheduleContest[];
}
