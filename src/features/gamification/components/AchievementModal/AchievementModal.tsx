"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAchievementConfetti } from "./useAchievementConfetti";
import type { AchievementModalProps } from "./types";

export function AchievementModal({
  achievement,
  nextHint,
  onClose,
}: AchievementModalProps) {
  useAchievementConfetti(!!achievement);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: -40 }}
            transition={{ type: "spring", damping: 18 }}
            className="p-10 text-center max-w-sm w-full mx-4"
            style={{
              border: "3px solid #ffbe0b",
              background: "#04000a",
              boxShadow:
                "0 0 60px rgba(255,190,11,0.3), 8px 8px 0 rgba(255,190,11,0.1)",
            }}
          >
            <div
              className="font-pixel text-[8px] text-[#ffbe0b] mb-6 tracking-widest"
              style={{ textShadow: "0 0 10px rgba(255,190,11,0.6)" }}
            >
              CONQUISTA DESBLOQUEADA!
            </div>

            <div
              className="w-20 h-20 flex items-center justify-center text-4xl mx-auto mb-6"
              style={{
                border: "3px solid #ffbe0b",
                boxShadow: "0 0 20px rgba(255,190,11,0.4)",
              }}
            >
              {achievement.icon}
            </div>

            <div className="font-pixel text-[10px] text-[#ffbe0b] mb-3">
              {achievement.name.toUpperCase()}
            </div>

            <div className="font-mono text-base text-[#7f7f9f] mb-4">
              {achievement.description}
            </div>

            <div
              className="font-pixel text-[8px] text-[#00ff41] inline-block mb-6 px-3 py-1"
              style={{
                border: "2px solid #00ff41",
                boxShadow: "0 0 8px rgba(0,255,65,0.3)",
              }}
            >
              +{achievement.xpReward} XP
            </div>

            {nextHint && (
              <div className="font-mono text-sm text-[#7f7f9f] mb-6 border-t border-[#222] pt-4">
                <span className="font-pixel text-[6px] text-[#555] block mb-1">
                  PRÓXIMA CONQUISTA
                </span>
                {nextHint}
              </div>
            )}

            <button
              onClick={onClose}
              className="font-pixel text-[8px] text-[#04000a] px-8 py-3 transition-all hover:scale-105"
              style={{ background: "#00ff41", boxShadow: "4px 4px 0 #007a1e" }}
            >
              CONTINUAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
