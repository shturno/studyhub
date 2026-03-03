"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateTrackDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = (await response.json()) as { error?: string };
          throw new Error(err.error ?? "Erro ao criar trilha");
        }
        const track = (await response.json()) as { id: string };
        toast.success("Trilha criada!");
        setOpen(false);
        setName("");
        setDescription("");
        router.refresh();
        router.push(`/tracks/${track.id}`);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Erro ao criar trilha";
        toast.error("Erro", { description: message });
      })
      .finally(() => setIsLoading(false));
  };

  return {
    open,
    setOpen,
    name,
    setName,
    description,
    setDescription,
    isLoading,
    handleSubmit,
  };
}
