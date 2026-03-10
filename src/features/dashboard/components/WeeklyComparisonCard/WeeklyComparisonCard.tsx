"use client";

import { TrendingUp, TrendingDown, Trophy, Minus } from "lucide-react";
import { formatWeekMinutes } from "@/features/dashboard/utils/weeklyComparisonUtils";

interface WeeklyComparisonCardProps {
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  deltaPercent: number;
  personalBestMinutes: number;
  last4Weeks: Array<{ weekLabel: string; minutes: number }>;
  isPersonalBest: boolean;
}

export function WeeklyComparisonCard({
  thisWeekMinutes,
  lastWeekMinutes,
  deltaPercent,
  personalBestMinutes,
  last4Weeks,
  isPersonalBest,
}: WeeklyComparisonCardProps) {
  const hasAnyData = last4Weeks.some((w) => w.minutes > 0);
  const maxMinutes = Math.max(...last4Weeks.map((w) => w.minutes), 1);

  const borderColor = isPersonalBest ? "#ffbe0b" : "rgba(0,255,65,0.4)";
  const glowStyle = isPersonalBest
    ? { border: `2px solid ${borderColor}`, background: "#04000a", boxShadow: "0 0 20px rgba(255,190,11,0.15)" }
    : { border: `2px solid ${borderColor}`, background: "#04000a" };

  const DeltaIcon =
    deltaPercent > 0 ? TrendingUp : deltaPercent < 0 ? TrendingDown : Minus;
  const deltaColor =
    deltaPercent > 0 ? "#00ff41" : deltaPercent < 0 ? "#ff6b6b" : "#7f7f9f";
  const deltaSign = deltaPercent > 0 ? "+" : "";

  return (
    <div className="p-4 space-y-4" style={glowStyle}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="font-pixel text-[8px]"
          style={{ color: isPersonalBest ? "#ffbe0b" : "#7f7f9f" }}
        >
          ── PERFORMANCE SEMANAL ──
        </span>
        {isPersonalBest && (
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3" style={{ color: "#ffbe0b" }} />
            <span
              className="font-pixel text-[6px]"
              style={{ color: "#ffbe0b", textShadow: "0 0 6px rgba(255,190,11,0.6)" }}
            >
              RECORDE PESSOAL
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* This week */}
        <div
          className="p-3 text-center"
          style={{ border: "1px solid rgba(0,255,65,0.2)", background: "#060011" }}
        >
          <div className="font-pixel text-[6px] text-[#7f7f9f] mb-1">ESTA SEMANA</div>
          <div
            className="font-pixel text-[10px]"
            style={{
              color: isPersonalBest ? "#ffbe0b" : "#00ff41",
              textShadow: isPersonalBest ? "0 0 8px rgba(255,190,11,0.5)" : "0 0 6px rgba(0,255,65,0.4)",
            }}
          >
            {formatWeekMinutes(thisWeekMinutes)}
          </div>
          {deltaPercent !== 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <DeltaIcon className="w-2.5 h-2.5" style={{ color: deltaColor }} />
              <span className="font-pixel text-[6px]" style={{ color: deltaColor }}>
                {deltaSign}{Math.abs(deltaPercent)}%
              </span>
            </div>
          )}
        </div>

        {/* Last week */}
        <div
          className="p-3 text-center"
          style={{ border: "1px solid rgba(255,255,255,0.05)", background: "#060011" }}
        >
          <div className="font-pixel text-[6px] text-[#7f7f9f] mb-1">SEM. PASSADA</div>
          <div className="font-pixel text-[10px] text-[#7f7f9f]">
            {formatWeekMinutes(lastWeekMinutes)}
          </div>
        </div>

        {/* Personal best */}
        <div
          className="p-3 text-center"
          style={{ border: "1px solid rgba(255,190,11,0.2)", background: "#060011" }}
        >
          <div className="font-pixel text-[6px] text-[#7f7f9f] mb-1">RECORDE</div>
          <div
            className="font-pixel text-[10px]"
            style={{ color: "#ffbe0b" }}
          >
            {formatWeekMinutes(personalBestMinutes)}
          </div>
        </div>
      </div>

      {/* Mini bar chart — last 4 weeks */}
      {hasAnyData && (
        <div>
          <div className="font-pixel text-[6px] text-[#555] mb-2">ÚLTIMAS 4 SEMANAS</div>
          <div className="flex items-end gap-2 h-10">
            {last4Weeks.map((week, idx) => {
              const isCurrentWeek = idx === 3;
              const heightPct = maxMinutes > 0 ? (week.minutes / maxMinutes) * 100 : 0;
              const barColor = isCurrentWeek
                ? isPersonalBest
                  ? "#ffbe0b"
                  : "#00ff41"
                : "#2a2a3a";
              return (
                <div key={week.weekLabel} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: "32px" }}>
                    <div
                      className="w-full transition-all duration-500"
                      style={{
                        height: `${Math.max(heightPct, week.minutes > 0 ? 8 : 0)}%`,
                        minHeight: week.minutes > 0 ? "2px" : "0px",
                        background: barColor,
                        boxShadow: isCurrentWeek && week.minutes > 0
                          ? `0 0 4px ${barColor}88`
                          : undefined,
                      }}
                    />
                  </div>
                  <span
                    className="font-pixel text-[5px]"
                    style={{ color: isCurrentWeek ? "#e0e0ff" : "#555" }}
                  >
                    {week.weekLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasAnyData && (
        <div className="text-center py-2">
          <div className="font-pixel text-[7px] text-[#555]">
            Sem dados ainda — complete sessões para ver sua evolução.
          </div>
        </div>
      )}
    </div>
  );
}
