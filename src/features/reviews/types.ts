export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export const QUALITY_LABELS: Record<
  ReviewQuality,
  { label: string; color: string }
> = {
  0: { label: "BLOQUEIO TOTAL", color: "#ff006e" },
  1: { label: "MUITO DIFÍCIL", color: "#ff4444" },
  2: { label: "DIFÍCIL", color: "#ff8800" },
  3: { label: "OK", color: "#ffbe0b" },
  4: { label: "BOM", color: "#7b61ff" },
  5: { label: "FÁCIL", color: "#00ff41" },
};

export interface ReviewWithTopic {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  scheduledFor: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

// Legacy — mantido para compatibilidade
export interface Review {
  id: string;
  topicId: string;
  scheduledFor: Date;
  completed: boolean;
  difficulty?: number;
}

export interface ReviewSchedule {
  intervals: number[];
  nextReviewDate: Date;
}
