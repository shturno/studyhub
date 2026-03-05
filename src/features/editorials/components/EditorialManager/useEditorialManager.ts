"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { savePlannedSession } from "@/features/study-cycle/actions";
import type { GeneratedSchedule, DayKey } from "@/features/ai/types";
import type { StudyAreaPriority } from "@/features/editorials/types";

const DEFAULT_DAILY_HOURS: Record<DayKey, number> = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 2,
  saturday: 0,
  sunday: 0,
};

export function useEditorialManager(
  contestId: string,
  role: string | undefined,
  examDateProp: string | null | undefined,
  onEditorialAdded?: () => void,
) {
  const router = useRouter();
  const t = useTranslations("EditorialManager");
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "availability" | "preview">(
    "upload",
  );
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState("");
  const [selectedRole, setSelectedRole] = useState(role || "");
  const [examDate, setExamDate] = useState(
    examDateProp ? examDateProp.split("T")[0] : "",
  );
  const [dailyHours, setDailyHours] = useState<Record<DayKey, number>>(
    DEFAULT_DAILY_HOURS,
  );
  const [generatedSchedule, setGeneratedSchedule] = useState<
    (GeneratedSchedule & { priorities?: StudyAreaPriority[] }) | null
  >(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChangeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validatePageRanges = (ranges: string): boolean => {
    if (!ranges.trim()) return false;
    const pageRangeRegex = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
    return pageRangeRegex.test(ranges.trim());
  };

  const handleSubmit = async () => {
    if (!selectedFile || !pageRanges.trim() || !selectedRole) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (!validatePageRanges(pageRanges)) {
      toast.error(t("invalidPageFormat"));
      return;
    }

    setIsParsing(true);

    try {
      const fileExtension = selectedFile.name.split(".").pop();
      const timestamp = Date.now();
      const blobFileName = `edital-${contestId}-${timestamp}.${fileExtension}`;

      const blobUrl = await upload(blobFileName, selectedFile, {
        access: "public",
        handleUploadUrl: `/api/editorials/upload`,
      });

      const res = await fetch("/api/editorials/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: blobUrl.url,
          contestId,
          pageRanges,
          role: selectedRole,
          examDate: examDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        let errorMsg = t("parseError");

        if (res.status === 413) {
          errorMsg = t("fileTooLarge");
        } else if (res.status === 401) {
          errorMsg = t("unauthorized");
        } else if (res.status === 400) {
          errorMsg = data.error || errorMsg;
        }

        throw new Error(errorMsg);
      }

      toast.success(t("extractSuccess"));
      setStep("availability");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("parseError");
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateSchedule = async () => {
    const weeklyTotal = Object.values(dailyHours).reduce((a, b) => a + b, 0);
    if (weeklyTotal <= 0) {
      toast.error(t("fillDailyHours"));
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/editorials/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId,
          dailyAvailableHours: dailyHours,
          examDate: examDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        let errorMsg = t("scheduleError");

        if (res.status === 401) {
          errorMsg = t("unauthorized");
        } else if (res.status === 400) {
          errorMsg = data.error || errorMsg;
        } else if (res.status >= 500) {
          errorMsg = t("serverError");
        }

        throw new Error(errorMsg);
      }

      const data = (await res.json()) as {
        schedule?: GeneratedSchedule & { priorities?: StudyAreaPriority[] };
      };

      if (data.schedule) {
        setGeneratedSchedule(data.schedule);
        setStep("preview");
        toast.success(t("scheduleGenerated"));
      } else {
        toast.error(t("scheduleError"));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("scheduleError");
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportSchedule = async () => {
    if (!generatedSchedule?.dailySessions?.length) {
      toast.error(t("noSessionsToImport"));
      return;
    }

    try {
      setIsSavingSchedule(true);

      const results = await Promise.allSettled(
        generatedSchedule.dailySessions.map((session) => {
          const topicName = session.topics[0];
          const priority =
            generatedSchedule.priorities?.find(
              (p) => p.topicName === topicName,
            ) || generatedSchedule.priorities?.[0];

          if (!priority) {
            return Promise.resolve(null);
          }

          return savePlannedSession({
            lessonId: priority.topicId,
            date: session.day.split(" ")[0],
            duration: session.duration,
          });
        }),
      );

      const successCount = results.filter((r) => {
        if (r.status === "fulfilled") {
          const result = r.value;
          return result && "success" in result && result.success;
        }
        return false;
      }).length;

      const failCount = results.length - successCount;

      if (failCount > 0) {
        toast.warning(
          t("importPartial", { success: successCount, failed: failCount }),
        );
      } else {
        toast.success(t("importSuccess", { count: successCount }));
      }

      resetDialog();
      router.refresh();
      onEditorialAdded?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("importError");
      toast.error(message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSkipSchedule = () => {
    resetDialog();
    router.refresh();
    onEditorialAdded?.();
  };

  const resetDialog = () => {
    setIsOpen(false);
    setStep("upload");
    setGeneratedSchedule(null);
    setSelectedFile(null);
    setPageRanges("");
    setSelectedRole(role || "");
    setExamDate(examDateProp ? examDateProp.split("T")[0] : "");
    setDailyHours(DEFAULT_DAILY_HOURS);
  };

  const handleGoBack = () => {
    if (step === "availability") {
      setStep("upload");
    } else if (step === "preview") {
      setStep("availability");
    }
  };

  const handleClose = () => {
    resetDialog();
  };

  return {
    isOpen,
    setIsOpen,
    step,
    isParsing,
    isGenerating,
    selectedFile,
    pageRanges,
    setPageRanges,
    selectedRole,
    setSelectedRole,
    examDate,
    setExamDate,
    dailyHours,
    setDailyHours,
    generatedSchedule,
    isSavingSchedule,
    fileInputRef,
    handleFileSelect,
    handleChangeFile,
    handleSubmit,
    handleGenerateSchedule,
    handleImportSchedule,
    handleSkipSchedule,
    handleGoBack,
    handleClose,
  };
}
