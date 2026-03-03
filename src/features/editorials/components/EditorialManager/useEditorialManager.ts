"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { savePlannedSession } from "@/features/study-cycle/actions";
import type { GeneratedSchedule } from "@/features/ai/types";
import type { StudyAreaPriority } from "@/features/editorials/types";

export function useEditorialManager(
  contestId: string,
  role: string | undefined,
  examDateProp: string | null | undefined,
  onEditorialAdded?: () => void,
) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState("");
  const [selectedRole, setSelectedRole] = useState(role || "");
  const [examDate, setExamDate] = useState(
    examDateProp ? examDateProp.split("T")[0] : "",
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
    if (!selectedFile || !pageRanges.trim()) {
      toast.error("Por favor, preencha as páginas e selecione um arquivo");
      return;
    }

    if (!validatePageRanges(pageRanges)) {
      toast.error("Formato de páginas inválido (ex: 1-5, 10, 15-20)");
      return;
    }

    setIsParsing(true);

    const blobUrl = await upload(selectedFile.name, selectedFile, {
      access: "public",
      handleBlobUploadUrl: `/api/editorials/upload`,
    });

    await fetch("/api/editorials/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blobUrl: blobUrl.url,
        contestId,
        pageRanges,
        role: selectedRole || undefined,
        examDate: examDate || undefined,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao processar editorial");
        const data = (await res.json()) as {
          schedule?: GeneratedSchedule & { priorities?: StudyAreaPriority[] };
        };

        if (data.schedule) {
          setGeneratedSchedule(data.schedule);
          toast.success("Editorial processado! Revise o cronograma.");
        } else {
          toast.success("Editorial importado com sucesso!");
          setIsOpen(false);
          router.refresh();
          onEditorialAdded?.();
        }
      })
      .catch(() => {
        toast.error("Erro ao processar editorial");
      })
      .finally(() => {
        setIsParsing(false);
      });
  };

  const handleImportSchedule = async () => {
    if (!generatedSchedule?.dailySessions?.length) {
      toast.error("Nenhuma sessão para importar");
      return;
    }

    try {
      setIsSavingSchedule(true);
      let count = 0;

      for (const session of generatedSchedule.dailySessions) {
        const topicName = session.topics[0];
        const priority =
          generatedSchedule.priorities?.find((p) => p.topicName === topicName) ||
          generatedSchedule.priorities?.[0];

        if (priority) {
          await savePlannedSession({
            lessonId: priority.topicId,
            date: session.day.split(" ")[0],
            duration: session.duration,
          });
          count++;
        }
      }

      toast.success(`✅ ${count} sessões importadas!`);
      setIsOpen(false);
      setGeneratedSchedule(null);
      router.refresh();
      onEditorialAdded?.();
    } catch {
      toast.error("Erro ao importar cronograma");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSkipSchedule = () => {
    setGeneratedSchedule(null);
    setIsOpen(false);
    router.refresh();
    onEditorialAdded?.();
  };

  return {
    isOpen,
    setIsOpen,
    isParsing,
    selectedFile,
    pageRanges,
    setPageRanges,
    selectedRole,
    setSelectedRole,
    examDate,
    setExamDate,
    generatedSchedule,
    isSavingSchedule,
    fileInputRef,
    handleFileSelect,
    handleChangeFile,
    handleSubmit,
    handleImportSchedule,
    handleSkipSchedule,
  };
}
