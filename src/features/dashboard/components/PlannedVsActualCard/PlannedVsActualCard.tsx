"use client";

import { CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import type { TodayPlannedSession } from "@/features/dashboard/types";

interface Props {
  planned: TodayPlannedSession[];
}

export function PlannedVsActualCard({ planned }: Props) {
  if (planned.length === 0) return null;

  const completed = planned.filter((p) => p.completed).length;
  const total = planned.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div
      className="p-4"
      style={{
        border: "2px solid rgba(0,245,255,0.4)",
        background: "#04000a",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <span className="font-pixel text-[8px]" style={{ color: "#00f5ff" }}>
            PLANEJADO VS REALIZADO
          </span>
        </div>
        <span className="font-pixel text-[8px] text-[#7f7f9f]">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 mb-3 relative overflow-hidden"
        style={{ background: "#1a1a00", border: "1px solid rgba(0,245,255,0.2)" }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? "linear-gradient(90deg, #00ff41, #00f5ff)"
              : "linear-gradient(90deg, #00f5ff, #0080ff)",
            boxShadow: pct === 100 ? "0 0 8px rgba(0,255,65,0.8)" : undefined,
          }}
        />
      </div>

      {/* Session list */}
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: "240px" }}>
        {planned.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-2 px-2 py-1.5"
            style={{
              background: session.completed ? "rgba(0,255,65,0.05)" : "rgba(0,245,255,0.03)",
              border: `1px solid ${session.completed ? "rgba(0,255,65,0.2)" : "rgba(0,245,255,0.1)"}`,
            }}
          >
            {session.completed ? (
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#00ff41" }} />
            ) : (
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "#7f7f9f" }} />
            )}
            <div className="flex-1 min-w-0">
              <div
                className="font-pixel text-[6px] truncate"
                style={{ color: session.completed ? "#7f7f9f" : "#7f7f9f" }}
              >
                {session.subjectName.toUpperCase()}
              </div>
              <div
                className="font-mono text-sm truncate"
                style={{ color: session.completed ? "#7f7f9f" : "#e0e0ff" }}
              >
                {session.topicName}
              </div>
            </div>
            <div
              className="font-pixel text-[6px] flex-shrink-0"
              style={{ color: session.completed ? "#00ff41" : "#7f7f9f" }}
            >
              {session.completed ? "✓ FEITO" : `${session.durationMinutes}min`}
            </div>
          </div>
        ))}
      </div>

      {pct === 100 && (
        <div
          className="mt-3 text-center font-pixel text-[7px]"
          style={{
            color: "#00ff41",
            textShadow: "0 0 8px rgba(0,255,65,0.6)",
          }}
        >
          ★ PLANEJAMENTO 100% CUMPRIDO ★
        </div>
      )}
    </div>
  );
}
