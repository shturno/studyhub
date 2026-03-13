"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveStudySession } from "../actions";
import { useAchievementModal } from "@/lib/achievement-modal-context";
import { useLevelUp } from "@/lib/level-up-context";
import {
  timerPersistence,
  type PersistedTimerState,
} from "@/features/timer/services/timerPersistence";

export interface UseStudyTimerOptions {
  topicId: string;
  initialMinutes?: number;
  onComplete?: (result: {
    xpEarned: number;
    newLevel: number;
    leveledUp: boolean;
  }) => void;
}

export function useStudyTimer({
  topicId,
  initialMinutes = 25,
  onComplete,
}: UseStudyTimerOptions) {
  const t = useTranslations("Timer");
  const { showAchievements } = useAchievementModal();
  const { showLevelUp } = useLevelUp();
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeRef = useRef(initialMinutes * 60);
  const tickRef = useRef(0);
  const startedAtRef = useRef(Date.now());

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    setHasCompleted(true);
    setIsSaving(true);

    try {
      const studiedMinutes = Math.ceil(totalTimeRef.current / 60);

      void timerPersistence.clear();

      if (studiedMinutes > 0) {
        const result = await saveStudySession({
          topicId,
          minutes: studiedMinutes,
          difficulty: null,
        });

        if (result.success) {
          toast.success(t("sessionSaved", { xp: result.data.xpEarned }), {
            description: result.data.leveledUp
              ? t("levelUp", { level: result.data.newLevel })
              : t("xpToNextLevel", { xp: result.data.xpToNextLevel }),
          });

          if (result.data.leveledUp) {
            showLevelUp(result.data.newLevel);
          }

          if (result.data.isNewStreakDay && result.data.streak > 1) {
            const multiplier = result.data.streakMultiplier;
            toast(
              `🔥 STREAK — DIA ${result.data.streak}`,
              {
                description: multiplier > 1
                  ? `Bônus ativo: ${multiplier}× XP`
                  : "Continue amanhã para ganhar bônus de XP!",
              },
            );
          }

          if (result.data.newAchievements.length > 0) {
            showAchievements(result.data.newAchievements);
          }

          if (onComplete) {
            onComplete(result.data);
          }
        } else {
          throw new Error(result.error);
        }
      }
    } catch {
      toast.error(t("saveError"), {
        description: t("saveErrorDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [topicId, onComplete, t, showAchievements, showLevelUp]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  const start = () => setIsRunning(true);

  const pause = () => setIsRunning(false);

  const reset = () => {
    void timerPersistence.clear();
    setTimeLeft(totalTimeRef.current);
    setIsRunning(false);
    setHasCompleted(false);
  };

  const setDuration = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      totalTimeRef.current = seconds;
    }
  };

  const restore = useCallback((state: PersistedTimerState) => {
    const remaining = Math.max(0, state.totalSeconds - state.elapsedSeconds);
    totalTimeRef.current = state.totalSeconds;
    tickRef.current = 0;
    startedAtRef.current = Date.now();
    setTimeLeft(remaining);
    setIsRunning(false);
    setHasCompleted(false);
  }, []);

  useEffect(() => {
    if (!isRunning || hasCompleted) return;
    tickRef.current++;
    if (tickRef.current % 5 === 0) {
      void timerPersistence.save({
        topicId,
        totalSeconds: totalTimeRef.current,
        elapsedSeconds: totalTimeRef.current - timeLeft,
        startedAt: startedAtRef.current,
        isRunning: true,
      });
    }
  }, [timeLeft, isRunning, hasCompleted, topicId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    ((totalTimeRef.current - timeLeft) / totalTimeRef.current) * 100;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    hasCompleted,
    isSaving,
    progress,
    start,
    pause,
    reset,
    setDuration,
    restore,
  };
}
