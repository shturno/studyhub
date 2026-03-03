"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function useCreateLessonDialog(trackId: string) {
  const t = useTranslations("StudyCycle");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [estimated, setEstimated] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setExternalUrl("");
    setEstimated("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await fetch(`/api/tracks/${trackId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        externalUrl: externalUrl || null,
        estimated: estimated || null,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = (await response.json()) as { error?: string };
          throw new Error(err.error ?? t("lessonError"));
        }
        toast.success(t("lessonCreated"));
        setOpen(false);
        resetForm();
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t("lessonError");
        toast.error("Erro", { description: message });
      })
      .finally(() => setIsLoading(false));
  };

  return {
    open,
    setOpen,
    title,
    setTitle,
    description,
    setDescription,
    externalUrl,
    setExternalUrl,
    estimated,
    setEstimated,
    isLoading,
    handleSubmit,
  };
}
