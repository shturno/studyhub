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

export type ReviewDifficulty = 1 | 2 | 3 | 4 | 5;
