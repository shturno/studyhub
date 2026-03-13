"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function useLevelUpAnimation(show: boolean, onComplete?: () => void) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00ff41", "#ffbe0b", "#ff006e", "#7b61ff"],
      });

      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return { isVisible };
}
