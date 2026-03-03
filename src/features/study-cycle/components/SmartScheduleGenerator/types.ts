import type { GeneratedSchedule } from "@/features/ai/types";
import type { StudyAreaPriority } from "@/features/editorials/types";

export interface SmartScheduleGeneratorProps {
  readonly contestId: string;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export interface ScheduleData {
  readonly schedule: GeneratedSchedule;
  readonly coverage: { readonly coverage: number };
  readonly priorities: StudyAreaPriority[];
}
