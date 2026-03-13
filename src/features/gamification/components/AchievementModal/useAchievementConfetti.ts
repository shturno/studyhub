"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function useAchievementConfetti(visible: boolean) {
  useEffect(() => {
    if (!visible) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#ffbe0b", "#00ff41", "#ff006e"],
    });
  }, [visible]);
}
