"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLessonChecklist() {
  const [updatingLessons, setUpdatingLessons] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const router = useRouter();

  const updateLessonStatus = async (
    lessonId: string,
    newStatus: "NOT_STARTED" | "IN_PROGRESS" | "DONE",
  ) => {
    setUpdatingLessons((prev) => new Set(prev).add(lessonId));

    await fetch(`/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao atualizar");
        router.refresh();
        toast.success("Status atualizado!");
      })
      .catch(() => {
        toast.error("Erro ao atualizar status");
      })
      .finally(() => {
        setUpdatingLessons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });
      });
  };

  const openLessonPanel = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setPanelOpen(true);
  };

  return {
    updatingLessons,
    selectedLessonId,
    panelOpen,
    setPanelOpen,
    updateLessonStatus,
    openLessonPanel,
  };
}
