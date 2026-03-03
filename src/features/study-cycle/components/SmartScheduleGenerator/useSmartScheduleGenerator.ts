"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePlannedSession } from "@/features/study-cycle/actions";
import type { ScheduleData } from "./types";

export function useSmartScheduleGenerator(
  contestId: string,
  onOpenChange: (open: boolean) => void,
) {
  const router = useRouter();
  const [examDate, setExamDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<ScheduleData | null>(null);

  const handleGenerateSchedule = async () => {
    if (!examDate) {
      toast.error("Selecione a data da prova");
      return;
    }

    setIsGenerating(true);
    await fetch("/api/ai/generate-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contestId,
        examDate,
        weeklyHours: Number.parseInt(weeklyHours),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = (await response.json()) as { error?: string };
          throw new Error(err.error ?? "Erro ao gerar cronograma");
        }
        const data = (await response.json()) as ScheduleData;
        setGeneratedSchedule(data);
        toast.success("Cronograma gerado!");
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Erro ao gerar cronograma",
        );
      })
      .finally(() => setIsGenerating(false));
  };

  const handleAcceptSchedule = async () => {
    if (
      !generatedSchedule?.schedule?.dailySessions ||
      generatedSchedule.schedule.dailySessions.length === 0
    ) {
      toast.error("Cronograma não contém sessões. Tente novamente.");
      return;
    }

    try {
      setIsSavingSchedule(true);

      let successCount = 0;
      for (const session of generatedSchedule.schedule.dailySessions) {
        try {
          const dateStr = session.day.split(" ")[0];

          const topicName = session.topics[0];
          let priority = generatedSchedule.priorities?.find(
            (p) => p.topicName === topicName,
          );

          if (!priority && generatedSchedule.priorities?.length) {
            priority = generatedSchedule.priorities[0];
          }

          if (priority) {
            await savePlannedSession({
              lessonId: priority.topicId,
              date: dateStr,
              duration: session.duration,
            });
            successCount++;
          }
        } catch {}
      }

      toast.success(
        `✅ ${successCount} sessões importadas do cronograma completo para o Planner!`,
      );
      onOpenChange(false);
      setGeneratedSchedule(null);
      setExamDate("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao importar cronograma",
      );
    } finally {
      setIsSavingSchedule(false);
    }
  };

  return {
    examDate,
    setExamDate,
    weeklyHours,
    setWeeklyHours,
    isGenerating,
    isSavingSchedule,
    generatedSchedule,
    setGeneratedSchedule,
    handleGenerateSchedule,
    handleAcceptSchedule,
  };
}
