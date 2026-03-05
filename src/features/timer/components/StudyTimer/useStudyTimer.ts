"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export function useStudyTimer(
  lessonId: string,
  onSessionComplete?: () => void,
) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [totalSessionTime, setTotalSessionTime] = useState(25 * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalSessionTime - timeLeft) / totalSessionTime) * 100;

  const saveSession = useCallback(
    async (studiedMinutes: number) => {
      if (studiedMinutes <= 0) return;
      await fetch(`/api/lessons/${lessonId}/study-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: studiedMinutes }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          setSessionMinutes((prev) => prev + studiedMinutes);
          toast.success("Sessão salva!");
          onSessionComplete?.();
        })
        .catch(() =>
          toast.error("Erro ao salvar sessão"),
        );
    },
    [lessonId, onSessionComplete],
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            const studiedMinutes = Math.ceil(totalSessionTime / 60);
            void saveSession(studiedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, totalSessionTime, saveSession]);

  const handleStop = async () => {
    setIsRunning(false);
    if (timeLeft < totalSessionTime) {
      const studiedMinutes = Math.ceil((totalSessionTime - timeLeft) / 60);
      await saveSession(studiedMinutes);
    }
    setTimeLeft(totalSessionTime);
  };

  const setTimerDuration = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setTotalSessionTime(seconds);
    }
  };

  return {
    timeLeft,
    isRunning,
    setIsRunning,
    sessionMinutes,
    totalSessionTime,
    formatTime,
    progress,
    handleStop,
    setTimerDuration,
  };
}
