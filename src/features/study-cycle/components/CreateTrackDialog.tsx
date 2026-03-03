"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateTrackDialogProps {
  readonly children: React.ReactNode;
}

export function CreateTrackDialog({ children }: CreateTrackDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NOVA TRILHA</DialogTitle>
          <DialogDescription>
            Crie uma nova trilha para organizar suas lições.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-name">NOME DA TRILHA</Label>
            <Input
              id="track-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Java & Spring Boot"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="track-desc">DESCRICAO (OPCIONAL)</Label>
            <Textarea
              id="track-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que você vai aprender..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              CANCELAR
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  CRIANDO...
                </>
              ) : (
                "CRIAR TRILHA"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
