"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateQuestions, logQuestionSession } from "@/features/topics/actions";
import type { QuestionState } from "./types";

interface UseQuestionPracticeProps {
  topicId: string;
  contestId?: string;
  onClose: () => void;
}

export function useQuestionPractice({
  topicId,
  contestId,
  onClose,
}: UseQuestionPracticeProps) {
  const [state, setState] = useState<QuestionState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    phase: "loading",
    score: 0,
    xpEarned: 0,
  });
  const [isAnswered, setIsAnswered] = useState(false);

  // Load questions on mount
  useEffect(() => {
    async function load() {
      const result = await generateQuestions(topicId, contestId || null, 5);
      if (result.success) {
        setState((prev) => ({
          ...prev,
          questions: result.data.questions,
          phase: "answering",
        }));
      } else {
        toast.error(result.error || "Erro ao gerar questões");
        onClose();
      }
    }
    load();
  }, [topicId, contestId, onClose]);

  const currentQuestion = state.questions[state.currentIndex];

  const handleAnswer = (answer: string) => {
    if (isAnswered || state.phase !== "answering") return;

    const isCorrect = answer === currentQuestion.answer;
    const questionId = currentQuestion.id;

    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: isCorrect,
      },
      score: isCorrect ? prev.score + 1 : prev.score,
    }));

    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
      setIsAnswered(false);
    } else {
      // All questions answered, move to results
      const xpEarned = state.score * 3;
      const questionIds = state.questions.map((q) => q.id);

      const result = await logQuestionSession({
        topicId,
        contestId,
        questionIds,
        correct: state.score,
        total: state.questions.length,
      });

      if (result.success) {
        setState((prev) => ({
          ...prev,
          phase: "results",
          xpEarned,
        }));
        toast.success(`+${xpEarned} XP ganho!`);
      } else {
        toast.error(result.error || "Erro ao registrar questões");
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return {
    state,
    currentQuestion,
    isAnswered,
    handleAnswer,
    handleNext,
    handleClose,
  };
}
