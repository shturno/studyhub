"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, Sword, X, Star } from "lucide-react";
import type { DailyMissionSummary } from "@/features/gamification/services/missionService";

interface DailyMissionsModalProps {
  missions: DailyMissionSummary[];
}

const STORAGE_KEY_PREFIX = "missions_seen_";

function todayKey(): string {
  return STORAGE_KEY_PREFIX + format(new Date(), "yyyy-MM-dd");
}

export function DailyMissionsModal({ missions }: DailyMissionsModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (missions.length === 0) return;
    try {
      const seen = localStorage.getItem(todayKey());
      if (!seen) setOpen(true);
    } catch {
      // localStorage unavailable (SSR/private mode)
    }
  }, [missions.length]);

  function handleClose() {
    try {
      localStorage.setItem(todayKey(), "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  if (!open || missions.length === 0) return null;

  const allCompleted = missions.every((m) => m.completed);
  const totalBonusXP = 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md"
        style={{
          border: "2px solid rgba(123,97,255,0.7)",
          background: "#04000a",
          boxShadow: "0 0 40px rgba(123,97,255,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(123,97,255,0.25)" }}
        >
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#7b61ff]" />
            <span className="font-pixel text-[9px] text-[#7b61ff]">
              MISSÕES DO DIA
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#555] hover:text-[#e0e0ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* All-completed banner */}
        {allCompleted && (
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{
              background: "rgba(0,255,65,0.08)",
              borderBottom: "1px solid rgba(0,255,65,0.2)",
            }}
          >
            <Star className="w-4 h-4 text-[#ffbe0b] fill-[#ffbe0b]" />
            <span className="font-mono text-sm text-[#00ff41]">
              Todas completas! +{totalBonusXP} XP bônus
            </span>
          </div>
        )}

        {/* Mission list */}
        <div className="p-5 space-y-3">
          {missions.map((mission) => {
            const pct = Math.min(
              Math.round((mission.progress / mission.targetValue) * 100),
              100,
            );
            return (
              <div
                key={mission.id}
                className="p-4 space-y-2"
                style={{
                  border: `1px solid ${mission.completed ? "rgba(0,255,65,0.4)" : "rgba(123,97,255,0.25)"}`,
                  background: mission.completed
                    ? "rgba(0,255,65,0.04)"
                    : "#020008",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {mission.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00ff41] mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#555] mt-0.5 shrink-0" />
                    )}
                    <span
                      className="font-mono text-sm leading-snug"
                      style={{
                        color: mission.completed ? "#7f7f9f" : "#e0e0ff",
                        textDecoration: mission.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {mission.label}
                    </span>
                  </div>
                  <span className="font-pixel text-[8px] text-[#7b61ff] shrink-0">
                    +{mission.xpReward} XP
                  </span>
                </div>

                {/* Progress bar */}
                {!mission.completed && (
                  <div className="space-y-1">
                    <div
                      className="w-full h-1.5"
                      style={{ background: "rgba(123,97,255,0.15)" }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background: "#7b61ff",
                        }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-[#555]">
                      <span>
                        {mission.progress}/{mission.targetValue}
                      </span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bonus hint */}
        {!allCompleted && (
          <div
            className="px-5 pb-4 font-mono text-xs text-[#555] text-center"
          >
            Complete as 3 missões para ganhar +{totalBonusXP} XP bônus
          </div>
        )}

        {/* Footer button */}
        <div
          className="px-5 pb-5"
          style={{ borderTop: "1px solid rgba(123,97,255,0.15)" }}
        >
          <button
            onClick={handleClose}
            className="mt-4 w-full font-pixel text-[9px] text-black bg-[#7b61ff] py-3 hover:opacity-90 transition-opacity"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}
