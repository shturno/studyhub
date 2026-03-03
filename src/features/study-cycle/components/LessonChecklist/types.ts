import type { Lesson } from "@/features/study-cycle/types";

export type { Lesson };

export interface LessonChecklistProps {
  readonly lessons: Lesson[];
  readonly trackId: string;
}
