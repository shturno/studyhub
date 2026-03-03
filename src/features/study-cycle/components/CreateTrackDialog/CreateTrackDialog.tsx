"use client";

import type React from "react";

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
import { Loader2 } from "lucide-react";
import { useCreateTrackDialog } from "./useCreateTrackDialog";
import type { CreateTrackDialogProps } from "./types";

export function CreateTrackDialog({ children }: CreateTrackDialogProps) {
  const { open, setOpen, name, setName, description, setDescription, isLoading, handleSubmit } =
    useCreateTrackDialog();

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
