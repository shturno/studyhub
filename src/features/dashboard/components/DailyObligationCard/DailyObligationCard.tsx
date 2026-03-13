"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";
import type { DailyObligationSummary } from "@/features/gamification/services/dailyObligationService";

interface Props {
  obligation: DailyObligationSummary;
  onStudyNow: () => void;
}

function CountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.hours < 2;

  return (
    <div
      className="flex items-center gap-1.5 font-pixel text-[7px]"
      style={{ color: isUrgent ? "#ff006e" : "#ffbe0b" }}
    >
      <Clock className="w-3 h-3" />
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")} para meia-noite
      </span>
    </div>
  );
}

export function DailyObligationCard({ obligation, onStudyNow }: Props) {
  if (obligation.completed) {
    return (
      <div
        className="p-4 flex items-center gap-3"
        style={{
          border: "2px solid #00ff41",
          background: "#00ff4108",
          boxShadow: "0 0 12px rgba(0,255,65,0.15)",
        }}
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#00ff41" }} />
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[7px] text-[#00ff41] mb-0.5">OBRIGAÇÃO CUMPRIDA</div>
          <div className="font-mono text-sm text-[#e0e0ff] truncate">
            {obligation.subjectName} — {obligation.topicName}
          </div>
        </div>
        <div
          className="font-pixel text-[10px] text-[#00ff41] px-2 py-1 flex-shrink-0"
          style={{ border: "1px solid #00ff41" }}
        >
          ✓ DONE
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4"
      style={{
        border: "2px solid #ff006e",
        background: "#1a0008",
        boxShadow: "0 0 20px rgba(255,0,110,0.25)",
        animation: "pulse-border 2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(255,0,110,0.25); }
          50% { box-shadow: 0 0 30px rgba(255,0,110,0.5); }
        }
      `}</style>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle
            className="w-4 h-4 flex-shrink-0 animate-pulse"
            style={{ color: "#ff006e" }}
          />
          <div className="min-w-0">
            <div className="font-pixel text-[7px] text-[#ff006e] mb-0.5">⚠ OBRIGAÇÃO DO DIA</div>
            <div className="font-pixel text-[8px] text-[#7f7f9f] truncate">
              {obligation.subjectName.toUpperCase()}
            </div>
            <div className="font-mono text-lg text-[#ff6e9c] font-semibold truncate">
              {obligation.topicName}
            </div>
          </div>
        </div>

        <div
          className="flex-shrink-0 flex flex-col items-end gap-1"
          style={{ color: "#ff006e" }}
        >
          <div className="font-pixel text-[7px]">PENALIDADE</div>
          <div
            className="font-pixel text-lg"
            style={{ textShadow: "0 0 8px rgba(255,0,110,0.8)" }}
          >
            −{obligation.xpPenalty} XP
          </div>
        </div>
      </div>

      {obligation.aiReasoning && (
        <div
          className="font-mono text-sm text-[#c084fc] mb-3 px-3 py-2"
          style={{
            border: "1px solid rgba(192,132,252,0.3)",
            background: "rgba(192,132,252,0.05)",
            borderLeft: "3px solid #c084fc",
          }}
        >
          IA: &ldquo;{obligation.aiReasoning}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <CountdownToMidnight />
        <button
          onClick={onStudyNow}
          className="font-pixel text-[9px] text-black bg-[#ff006e] px-4 py-2 flex items-center gap-2 hover:bg-[#ff339e] transition-colors"
          style={{ boxShadow: "3px 3px 0px #800037" }}
        >
          <Zap className="w-4 h-4 fill-black" />
          CUMPRIR AGORA
        </button>
      </div>

      <div
        className="mt-2 font-pixel text-[6px] text-[#7f7f9f]"
      >
        Mínimo 15 minutos neste tópico para cumprir a obrigação
      </div>
    </div>
  );
}
