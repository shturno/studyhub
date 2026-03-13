"use client";

import { useState, useEffect } from "react";
import {
  timerPersistence,
  type PersistedTimerState,
} from "@/features/timer/services/timerPersistence";

const MAX_AGE_SECONDS = 7200;

export function useTimerRecovery(
  onRecover: (state: PersistedTimerState) => void,
) {
  const [pending, setPending] = useState<PersistedTimerState | null>(null);

  useEffect(() => {
    timerPersistence.load().then((state) => {
      if (!state) return;

      const age = (Date.now() - state.startedAt) / 1000;
      if (age > MAX_AGE_SECONDS) {
        void timerPersistence.clear();
        return;
      }

      if (state.isRunning) {
        state.elapsedSeconds = Math.min(
          state.totalSeconds,
          state.elapsedSeconds + Math.floor(age),
        );
      }

      setPending(state);
    });
  }, []);

  function recover() {
    if (pending) onRecover(pending);
    setPending(null);
  }

  function dismiss() {
    void timerPersistence.clear();
    setPending(null);
  }

  return { pending, recover, dismiss };
}
