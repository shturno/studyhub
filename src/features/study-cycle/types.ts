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
}

export interface StudyLog {
  id: string;
  lessonId: string;
  minutes: number;
  createdAt: Date;
}
