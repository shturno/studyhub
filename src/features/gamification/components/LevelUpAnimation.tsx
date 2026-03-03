"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface LevelUpAnimationProps {
  readonly show: boolean;
  readonly newLevel: number;
  readonly onComplete?: () => void;
}

export function LevelUpAnimation({
  show,
  newLevel,
  onComplete,
}: LevelUpAnimationProps) {
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50 }}
            transition={{ type: "spring", damping: 15 }}
            className="p-12 text-center"
            style={{
              border: "3px solid #ffbe0b",
              background: "#04000a",
              boxShadow:
                "0 0 60px rgba(255,190,11,0.3), 8px 8px 0 rgba(255,190,11,0.1)",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Trophy
                className="h-20 w-20 mx-auto mb-6 text-[#ffbe0b]"
                style={{ filter: "drop-shadow(0 0 20px rgba(255,190,11,0.6))" }}
              />
            </motion.div>

            <div
              className="font-pixel text-2xl text-[#ffbe0b] mb-3"
              style={{ textShadow: "0 0 20px rgba(255,190,11,0.6)" }}
            >
              LEVEL UP!
            </div>

            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ffbe0b]" />
              <div className="font-pixel text-lg text-[#00ff41]">
                NIVEL {newLevel}
              </div>
              <Sparkles className="h-5 w-5 text-[#ffbe0b]" />
            </div>

            <div className="font-mono text-lg text-[#7f7f9f] mt-4">
              Continue assim! 🎉
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
