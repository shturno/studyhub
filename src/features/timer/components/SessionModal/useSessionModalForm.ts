"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSessionModal } from "@/features/timer/context/SessionModalContext";
import { toast } from "sonner";
import { type TrackOption, type LessonOption } from "./types";

export function useSessionModalForm() {
  const t = useTranslations("SessionModal");
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
          toast.error(t("tracksError"));
        });
    }
  }, [isOpen, trackId, t]);

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
          toast.error(t("lessonsError"));
        });
    }
  }, [selectedTrackId, lessonId, t]);

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
      toast.error(t("selectLesson"));
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
        if (!response.ok) throw new Error(t("createError"));
        toast.success(t("sessionCreated"));
        closeModal();
        resetForm();
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t("createError");
        toast.error("Erro", { description: message });
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
