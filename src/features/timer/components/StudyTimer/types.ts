export interface StudyTimerProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly onSessionComplete?: () => void;
}

export const DURATIONS = [15, 25, 45, 60] as const;
