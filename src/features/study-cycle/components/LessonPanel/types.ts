import type { Lesson } from "@/features/study-cycle/types";

export type { Lesson };

export interface LessonPanelProps {
  readonly lessonId: string | null;
  readonly trackId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}
