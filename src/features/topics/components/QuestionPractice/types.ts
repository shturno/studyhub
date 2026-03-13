import type { GeneratedQuestionData } from "@/features/topics/actions";

export interface QuestionPracticeProps {
  readonly topicId: string;
  readonly topicName: string;
  readonly contestId?: string;
  readonly onClose: () => void;
}

export interface QuestionState {
  questions: GeneratedQuestionData[];
  currentIndex: number;
  answers: Record<string, boolean>; // questionId → isCorrect
  phase: "loading" | "answering" | "results";
  score: number;
  xpEarned: number;
}
