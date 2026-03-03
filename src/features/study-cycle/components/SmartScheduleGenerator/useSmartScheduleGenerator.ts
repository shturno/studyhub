"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { savePlannedSession } from "@/features/study-cycle/actions";
import type { ScheduleData } from "./types";

export function useSmartScheduleGenerator(
  contestId: string,
  onOpenChange: (open: boolean) => void,
) {
  const router = useRouter();
  const t = useTranslations("SmartScheduleGenerator");
  const [examDate, setExamDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<ScheduleData | null>(null);

  const handleGenerateSchedule = async () => {
    if (!examDate) {
      toast.error(t("selectExamDate"));
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
          throw new Error(err.error ?? t("scheduleError"));
        }
        const data = (await response.json()) as ScheduleData;
        setGeneratedSchedule(data);
        toast.success(t("scheduleGenerated"));
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : t("scheduleError"),
        );
      })
      .finally(() => setIsGenerating(false));
  };

  const handleAcceptSchedule = async () => {
    if (
      !generatedSchedule?.schedule?.dailySessions ||
      generatedSchedule.schedule.dailySessions.length === 0
    ) {
      toast.error(t("noSessions"));
      return;
    }

    try {
      setIsSavingSchedule(true);

      let successCount = 0;
      let failCount = 0;
      for (const session of generatedSchedule.schedule.dailySessions) {
        const dateStr = session.day.split(" ")[0];

        const topicName = session.topics[0];
        let priority = generatedSchedule.priorities?.find(
          (p) => p.topicName === topicName,
        );

        if (!priority && generatedSchedule.priorities?.length) {
          priority = generatedSchedule.priorities[0];
        }

        if (priority) {
          const result = await savePlannedSession({
            lessonId: priority.topicId,
            date: dateStr,
            duration: session.duration,
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            console.error("Failed to save planned session:", result.error);
          }
        }
      }

      if (failCount > 0) {
        toast.warning(
          t("importPartial", { success: successCount, failed: failCount }),
        );
      } else {
        toast.success(t("importSuccess", { count: successCount }));
      }
      onOpenChange(false);
      setGeneratedSchedule(null);
      setExamDate("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("importError"),
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
