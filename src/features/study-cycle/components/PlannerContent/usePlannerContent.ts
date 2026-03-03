"use client";

import { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useSessionModal } from "@/features/timer/context/SessionModalContext";
import { toast } from "sonner";
import {
  savePlannedSession,
  removePlannedSession,
} from "@/features/study-cycle/actions";
import type { Lesson, PlannedSession } from "@/features/study-cycle/types";

export function usePlannerContent(data: {
  availableLessons: Lesson[];
  plannedSessions: PlannedSession[];
}) {
  const [availableLessons] = useState(data.availableLessons);
  const [plannedSessions, setPlannedSessions] = useState(data.plannedSessions);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isScheduleGeneratorOpen, setIsScheduleGeneratorOpen] = useState(false);
  const { openModal } = useSessionModal();

  const handleDragStart = (event: DragStartEvent) => {
    const lesson = availableLessons.find((l) => l.id === event.active.id);
    setActiveLesson(lesson ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLesson(null);
    if (!over) return;

    if (over.id === "planner-area") {
      const lesson = availableLessons.find((l) => l.id === active.id);
      if (!lesson) return;

      const tempId = `temp-${Date.now()}`;
      const newSession: PlannedSession = {
        id: tempId,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        trackName: lesson.track?.name ?? "",
        duration: lesson.estimated ?? 25,
        scheduledDate: new Date().toISOString().split("T")[0],
        draft: true,
      };
      setPlannedSessions((prev) => [...prev, newSession]);

      const result = await savePlannedSession({
        lessonId: lesson.id,
        date: newSession.scheduledDate,
        duration: newSession.duration,
      });

      if (!result.success) {
        setPlannedSessions((prev) => prev.filter((s) => s.id !== tempId));
        toast.error("Erro ao salvar", { description: result.error });
      } else {
        toast.success("Sessão agendada!", {
          description: `${lesson.title} salvo no planner`,
        });
      }
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    const previousSessions = [...plannedSessions];
    setPlannedSessions((prev) => prev.filter((s) => s.id !== sessionId));

    const result = await removePlannedSession(sessionId);
    if (!result.success) {
      setPlannedSessions(previousSessions);
      toast.error("Erro ao remover", { description: result.error });
    } else {
      toast.success("Sessão removida");
    }
  };

  const handleEditSession = (session: PlannedSession) => {
    openModal(session.lessonId, session.lessonId);
  };

  return {
    availableLessons,
    plannedSessions,
    activeLesson,
    isScheduleGeneratorOpen,
    setIsScheduleGeneratorOpen,
    handleDragStart,
    handleDragEnd,
    handleRemoveSession,
    handleEditSession,
  };
}
