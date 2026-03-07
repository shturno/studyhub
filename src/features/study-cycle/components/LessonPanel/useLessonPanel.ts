"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Lesson } from "@/features/study-cycle/types";

export function useLessonPanel(lessonId: string | null, open: boolean) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lessonId && open) {
      setLoading(true);
      setError(false);
      fetch(`/api/lessons/${lessonId}`)
        .then((res) => res.json() as Promise<Lesson>)
        .then((data) => {
          setLesson(data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
          toast.error("Erro ao carregar lição");
        });
    }
  }, [lessonId, open]);

  const refreshLesson = async () => {
    if (lessonId) {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (!res.ok) throw new Error("Failed to refresh lesson");
        const data = (await res.json()) as Lesson;
        setLesson(data);
      } catch {
        toast.error("Erro ao atualizar lição");
      }
    }
  };

  const totalStudyTime =
    lesson?.studyLogs.reduce((sum, log) => sum + log.minutes, 0) ?? 0;
  const studySessionsCount = lesson?.studyLogs.length ?? 0;

  const statusLabel =
    lesson?.status === "DONE"
      ? "CONCLUIDA"
      : lesson?.status === "IN_PROGRESS"
        ? "EM ANDAMENTO"
        : "NAO INICIADA";
  const statusVariant =
    lesson?.status === "DONE"
      ? "default"
      : lesson?.status === "IN_PROGRESS"
        ? "secondary"
        : "outline";

  return {
    lesson,
    loading,
    error,
    totalStudyTime,
    studySessionsCount,
    statusLabel,
    statusVariant,
    refreshLesson,
  };
}
