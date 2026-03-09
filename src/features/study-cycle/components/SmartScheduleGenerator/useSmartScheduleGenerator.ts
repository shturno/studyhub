"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePlannedSession } from "@/features/study-cycle/actions";
import type { DayKey } from "@/features/ai/types";
import type { ContestSummary } from "@/features/study-cycle/types";
import type { ScheduleData, DayHours } from "./types";

const DEFAULT_DAY_HOURS: DayHours = {
  monday: 3,
  tuesday: 3,
  wednesday: 3,
  thursday: 3,
  friday: 3,
  saturday: 0,
  sunday: 0,
};

export type GeneratorStep = "contests" | "availability" | "result";

export function useSmartScheduleGenerator(
  allContests: ContestSummary[],
  onOpenChange: (open: boolean) => void,
) {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<GeneratorStep>("contests");

  // Step 1 — contest selection & manual priority
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allContests.map((c) => c.id)),
  );
  const [manualPriorities, setManualPriorities] = useState<
    Record<string, number>
  >(() =>
    Object.fromEntries(allContests.map((c) => [c.id, c.manualPriority ?? 0])),
  );

  // Step 2 — availability
  const [dayHours, setDayHours] = useState<DayHours>(DEFAULT_DAY_HOURS);
  const totalWeeklyHours = Object.values(dayHours).reduce((s, h) => s + h, 0);

  // Step 3 — result
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<ScheduleData | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  function toggleContest(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setDayHour(day: DayKey, value: number) {
    setDayHours((prev) => ({ ...prev, [day]: value }));
  }

  function setManualPriority(contestId: string, value: number) {
    setManualPriorities((prev) => ({ ...prev, [contestId]: value }));
  }

  function reset() {
    setStep("contests");
    setSelectedIds(new Set(allContests.map((c) => c.id)));
    setDayHours(DEFAULT_DAY_HOURS);
    setGeneratedSchedule(null);
    setIsGenerating(false);
    setIsSavingSchedule(false);
  }

  // ── actions ──────────────────────────────────────────────────────────────

  async function handleGenerateSchedule() {
    if (selectedIds.size === 0) {
      toast.error("Selecione ao menos um concurso.");
      return;
    }
    if (totalWeeklyHours <= 0) {
      toast.error("Configure pelo menos 1 hora disponível por semana.");
      return;
    }

    setIsGenerating(true);
    setStep("result");

    try {
      const response = await fetch("/api/ai/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestIds: Array.from(selectedIds),
          weeklyHours: totalWeeklyHours,
          dailyHours: dayHours,
        }),
      });

      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? "Não foi possível gerar o cronograma");
      }

      const data = (await response.json()) as ScheduleData;
      setGeneratedSchedule(data);
      toast.success("Cronograma gerado!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar cronograma");
      setStep("availability");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAcceptSchedule() {
    if (
      !generatedSchedule?.schedule?.dailySessions ||
      generatedSchedule.schedule.dailySessions.length === 0
    ) {
      toast.error("Cronograma sem sessões. Tente novamente.");
      return;
    }

    setIsSavingSchedule(true);

    try {
      // Build a map of topicId → priority for fast lookup
      const priorityByTopicId = new Map(
        generatedSchedule.priorities.map((p) => [p.topicId, p]),
      );
      // Also index by exact topic name (fallback)
      const priorityByName = new Map(
        generatedSchedule.priorities.map((p) => [p.topicName.toLowerCase(), p]),
      );

      const savePromises = generatedSchedule.schedule.dailySessions.flatMap(
        (session) => {
          const dateStr = session.day.split(" ")[0];
          const topics = session.topics.filter(Boolean);
          const durationPerTopic = Math.max(
            Math.round(session.duration / Math.max(topics.length, 1)),
            15,
          );

          return topics.map(async (topicName) => {
            // Try to find the matching priority by name
            const priority =
              priorityByName.get(topicName?.toLowerCase() ?? "") ??
              // Strip the [Contest] tag if present and retry
              priorityByName.get(
                topicName?.replace(/\s*\[.*?\]\s*$/, "").toLowerCase() ?? "",
              );

            if (!priority) return { success: false };

            // Prefer topicId from priority map to guarantee correct DB record
            const resolvedPriority = priorityByTopicId.get(priority.topicId) ?? priority;

            return savePlannedSession({
              lessonId: resolvedPriority.topicId,
              date: dateStr,
              duration: durationPerTopic,
              contestId: resolvedPriority.contestId,
            });
          });
        },
      );

      const results = await Promise.all(savePromises);
      const successCount = results.filter((r) => r && "data" in r && r.success).length;
      const failCount = results.length - successCount;

      if (failCount > 0) {
        toast.warning(
          `${successCount} sessões salvas, ${failCount} falharam.`,
        );
      } else {
        toast.success(`${successCount} sessões importadas para o Planner!`);
      }

      onOpenChange(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao importar cronograma",
      );
    } finally {
      setIsSavingSchedule(false);
    }
  }

  return {
    // Step
    step,
    setStep,
    // Step 1
    selectedIds,
    toggleContest,
    manualPriorities,
    setManualPriority,
    // Step 2
    dayHours,
    setDayHour,
    totalWeeklyHours,
    // Step 3
    isGenerating,
    isSavingSchedule,
    generatedSchedule,
    setGeneratedSchedule,
    // Actions
    handleGenerateSchedule,
    handleAcceptSchedule,
    reset,
  };
}

