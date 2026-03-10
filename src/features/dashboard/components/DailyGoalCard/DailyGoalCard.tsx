"use client";

import { Target, CheckCircle2, Settings2 } from "lucide-react";
import Link from "next/link";
import { formatMinutes, computeDailyGoalInfo } from "@/features/dashboard/utils/dailyGoalUtils";

interface DailyGoalCardProps {
  targetMinutes: number;
  studiedTodayMinutes: number;
}

export function DailyGoalCard({ targetMinutes, studiedTodayMinutes }: DailyGoalCardProps) {
  const info = computeDailyGoalInfo(targetMinutes, studiedTodayMinutes);

  if (info.state === "no-goal") {
    return (
      <div
        className="p-4"
        style={{ border: "2px solid #333", background: "#04000a" }}
      >
        <div className="font-pixel text-[8px] text-[#555] mb-3">── META DO DIA ──</div>
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-[#555]" />
          <div>
            <div className="font-pixel text-[7px] text-[#555] mb-1">
              NENHUMA META CONFIGURADA
            </div>
            <Link href="/settings">
              <span
                className="font-pixel text-[7px] flex items-center gap-1"
                style={{ color: "#00ff41" }}
              >
                <Settings2 className="w-3 h-3" />
                CONFIGURAR META
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (info.state === "complete") {
    return (
      <div
        className="p-4"
        style={{
          border: "2px solid #ffbe0b",
          background: "#04000a",
          boxShadow: "0 0 15px rgba(255,190,11,0.2)",
        }}
      >
        <div className="font-pixel text-[8px] mb-3" style={{ color: "#ffbe0b" }}>
          ── META DO DIA ──
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: "#ffbe0b" }} />
            <span className="font-pixel text-[8px]" style={{ color: "#ffbe0b" }}>
              META CONCLUÍDA!
            </span>
          </div>
          <div className="text-right">
            <div
              className="font-pixel text-[10px]"
              style={{ color: "#ffbe0b", textShadow: "0 0 8px rgba(255,190,11,0.6)" }}
            >
              {formatMinutes(studiedTodayMinutes)}
            </div>
            <div className="font-pixel text-[6px] text-[#7f7f9f]">
              META: {formatMinutes(targetMinutes)}
            </div>
          </div>
        </div>
        <div
          className="w-full h-3 relative overflow-hidden"
          style={{ background: "#1a1400", border: "1px solid rgba(255,190,11,0.3)" }}
        >
          <div
            className="h-full"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #ff9f00, #ffbe0b)",
              boxShadow: "0 0 8px rgba(255,190,11,0.8)",
            }}
          />
        </div>
        <div className="font-pixel text-[6px] text-right mt-1" style={{ color: "#ffbe0b" }}>
          100% ✓
        </div>
      </div>
    );
  }

  // in-progress
  const { pct, remaining, barColor } = info;

  return (
    <div
      className="p-4"
      style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}
    >
      <div className="font-pixel text-[8px] text-[#7f7f9f] mb-3">── META DO DIA ──</div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: barColor }} />
          <span className="font-pixel text-[7px]" style={{ color: barColor }}>
            EM PROGRESSO
          </span>
        </div>
        <div className="text-right">
          <div className="font-pixel text-[9px]" style={{ color: barColor }}>
            {formatMinutes(studiedTodayMinutes)}
            <span className="text-[#555]"> / {formatMinutes(targetMinutes)}</span>
          </div>
          <div className="font-pixel text-[6px] text-[#555]">
            FALTAM {formatMinutes(remaining)}
          </div>
        </div>
      </div>
      <div
        className="w-full h-3 relative overflow-hidden"
        style={{ background: "#0a0a0a", border: "1px solid rgba(0,255,65,0.15)" }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            boxShadow: pct >= 75 ? `0 0 6px ${barColor}88` : undefined,
          }}
        />
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="absolute top-0 h-full w-px"
            style={{ left: `${mark}%`, background: "rgba(0,0,0,0.5)" }}
          />
        ))}
      </div>
      <div
        className="font-pixel text-[6px] text-right mt-1"
        style={{ color: pct >= 75 ? barColor : "#555" }}
      >
        {pct}%
      </div>
    </div>
  );
}
