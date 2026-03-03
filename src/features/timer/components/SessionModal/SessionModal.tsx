"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Loader2 } from "lucide-react";
import { useSessionModalForm } from "./useSessionModalForm";

export function SessionModal() {
  const {
    tracks,
    lessons,
    selectedTrackId,
    setSelectedTrackId,
    selectedLessonId,
    setSelectedLessonId,
    duration,
    setDuration,
    notes,
    setNotes,
    scheduledDate,
    setScheduledDate,
    loading,
    isOpen,
    handleClose,
    handleSubmit,
  } = useSessionModalForm();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>NOVA SESSAO</DialogTitle>
          <DialogDescription>
            Crie uma sessão de estudo para organizar seus estudos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track">TRILHA</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{track.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">LICAO</Label>
            <Select
              value={selectedLessonId}
              onValueChange={setSelectedLessonId}
              disabled={!selectedTrackId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lição" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">DURACAO (MIN)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">DATA (OPCIONAL)</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">NOTAS (OPCIONAL)</Label>
            <Textarea
              placeholder="Adicione notas sobre esta sessão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              RASCUNHO
            </Badge>
            <span className="font-mono text-sm text-[#555]">
              Sessão salva como rascunho
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              CANCELAR
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  CRIANDO...
                </>
              ) : (
                "CRIAR SESSAO"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
