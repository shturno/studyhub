import type { GeneratedSchedule } from "@/features/ai/types";
import type { StudyAreaPriority } from "@/features/editorials/types";

export interface EditorialManagerProps {
  readonly contestId: string;
  readonly role?: string;
  readonly examDate?: string | null;
  readonly onEditorialAdded?: () => void;
}

export type EditorialSchedulePreview = GeneratedSchedule & {
  priorities?: StudyAreaPriority[];
};
