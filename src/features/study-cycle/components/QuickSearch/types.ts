import type { Track, Lesson } from "@/features/study-cycle/types";

export interface QuickSearchProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly tracks: Track[];
  readonly lessons: Lesson[];
}
