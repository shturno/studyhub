export interface Track {
  id: string;
  name: string;
  description?: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  trackId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
  estimated: number | null;
  studyLogs: StudyLog[];
  track?: Track;
  description?: string | null;
  externalUrl?: string | null;
}

export interface StudyLog {
  id: string;
  lessonId: string;
  minutes: number;
  createdAt: Date;
}

export type ViewMode = "diario" | "semanal" | "mensal" | "completo";

export interface PlannedSession {
  readonly id: string;
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly trackName: string;
  readonly duration: number;
  readonly scheduledDate: string;
  readonly draft: boolean;
}

export interface SessionsByDate {
  readonly dateStr: string;
  readonly sessions: PlannedSession[];
}

export interface SessionsByWeek {
  readonly weekKey: string;
  readonly entries: SessionsByDate[];
}

export interface SessionsByMonth {
  readonly monthKey: string;
  readonly entries: SessionsByDate[];
}

export interface PlannerData {
  readonly primaryContestId?: string;
  readonly tracks: Array<{
    readonly id: string;
    readonly name: string;
    readonly lessons: Lesson[];
  }>;
  readonly availableLessons: Lesson[];
  readonly plannedSessions: PlannedSession[];
}
