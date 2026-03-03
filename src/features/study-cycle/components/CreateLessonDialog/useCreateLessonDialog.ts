"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function useCreateLessonDialog(trackId: string) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [estimated, setEstimated] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
          throw new Error(err.error ?? "Erro ao criar lição");
        }
        toast({ title: "Lição criada!" });
        setOpen(false);
        resetForm();
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Erro ao criar lição";
        toast({ title: "Erro", description: message, variant: "destructive" });
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
