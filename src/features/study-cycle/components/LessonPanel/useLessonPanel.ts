"use client";

import { useState, useEffect } from "react";
import type { Lesson } from "@/features/study-cycle/types";

export function useLessonPanel(lessonId: string | null, open: boolean) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId && open) {
      setLoading(true);
      fetch(`/api/lessons/${lessonId}`)
        .then((res) => res.json() as Promise<Lesson>)
        .then((data) => {
          setLesson(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [lessonId, open]);

  const refreshLesson = async () => {
    if (lessonId) {
      const res = await fetch(`/api/lessons/${lessonId}`);
      const data = (await res.json()) as Lesson;
      setLesson(data);
    }
  };

  const totalStudyTime = lesson?.studyLogs.reduce((sum, log) => sum + log.minutes, 0) ?? 0;
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
    totalStudyTime,
    studySessionsCount,
    statusLabel,
    statusVariant,
    refreshLesson,
  };
}
