"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function useCreateTrackDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
        toast({ title: "Trilha criada!" });
        setOpen(false);
        setName("");
        setDescription("");
        router.refresh();
        router.push(`/tracks/${track.id}`);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Erro ao criar trilha";
        toast({ title: "Erro", description: message, variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  return { open, setOpen, name, setName, description, setDescription, isLoading, handleSubmit };
}
