"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionModal } from "@/features/timer/context/SessionModalContext";
import { useToast } from "@/hooks/use-toast";
import { type TrackOption, type LessonOption } from "./types";

export function useSessionModalForm() {
  const { isOpen, closeModal, lessonId, trackId } = useSessionModal();
  const [tracks, setTracks] = useState<TrackOption[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [duration, setDuration] = useState<string>("25");
  const [notes, setNotes] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetch("/api/tracks")
        .then((res) => res.json())
        .then((data: TrackOption[]) => {
          setTracks(data);
          if (trackId) {
            setSelectedTrackId(trackId);
          }
        })
        .catch(() => {
          toast({ title: "Erro ao carregar trilhas", variant: "destructive" });
        });
    }
  }, [isOpen, trackId, toast]);

  useEffect(() => {
    if (selectedTrackId) {
      fetch(`/api/tracks/${selectedTrackId}`)
        .then((res) => res.json())
        .then((data: { lessons?: LessonOption[] }) => {
          setLessons(data.lessons ?? []);
          if (lessonId) {
            setSelectedLessonId(lessonId);
          }
        })
        .catch(() => {
          toast({ title: "Erro ao carregar lições", variant: "destructive" });
        });
    }
  }, [selectedTrackId, lessonId, toast]);

  const resetForm = () => {
    setSelectedTrackId("");
    setSelectedLessonId("");
    setDuration("25");
    setNotes("");
    setScheduledDate("");
  };

  const handleClose = () => {
    closeModal();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId || !duration) {
      toast({
        title: "Selecione uma lição e defina a duração",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: selectedLessonId,
        duration: Number.parseInt(duration),
        notes,
        scheduledDate: scheduledDate || null,
        draft: true,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Erro ao criar sessão");
        toast({ title: "Sessão criada!" });
        closeModal();
        resetForm();
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast({ title: "Erro", description: message, variant: "destructive" });
      });

    setLoading(false);
  };

  return {
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
  };
}
