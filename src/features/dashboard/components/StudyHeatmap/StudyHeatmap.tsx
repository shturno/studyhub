"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HeatmapDay } from "@/features/dashboard/types";
import type { GridCell } from "./types";

interface StudyHeatmapProps {
  heatmap: HeatmapDay[];
}

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function getColor(minutes: number): string {
  if (minutes === 0) return "#1a1a2e";
  if (minutes < 25) return "#003b1a";
  if (minutes < 60) return "#006b1a";
  if (minutes < 120) return "#00bb2d";
  return "#00ff41";
}

function buildGrid(heatmap: HeatmapDay[]): GridCell[][] {
  const map = new Map(heatmap.map((d) => [d.date, d]));
  const today = new Date();
  const days: GridCell[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key);
    days.push({ date: key, count: entry?.count ?? 0, minutes: entry?.minutes ?? 0 });
  }

  // Padding para alinhar ao dia da semana correto (0=domingo)
  const firstDayOfWeek = new Date(days[0].date).getDay();
  const paddingCells: GridCell[] = Array.from(
    { length: firstDayOfWeek },
    () => ({ date: "", count: -1, minutes: 0 }),
  );

  const allCells = [...paddingCells, ...days];

  const weeks: GridCell[][] = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }
  return weeks;
}

function buildMonthLabels(
  weeks: GridCell[][],
): (string | null)[] {
  return weeks.map((week) => {
    // Primeira célula real da semana (não padding)
    const firstReal = week.find((c) => c.count !== -1 && c.date !== "");
    if (!firstReal) return null;
    const d = new Date(firstReal.date);
    const day = d.getDate();
    // Mostrar o mês se for a primeira semana do mês (dias 1-7)
    if (day <= 7) {
      return MONTH_NAMES[d.getMonth()];
    }
    return null;
  });
}

export function StudyHeatmap({ heatmap }: StudyHeatmapProps) {
  const weeks = buildGrid(heatmap);
  const monthLabels = buildMonthLabels(weeks);

  return (
    <div
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
      }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
      >
        <span className="font-pixel text-[8px] text-[#00ff41]">
          ── ACTIVITY HEATMAP ──
        </span>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="min-w-max space-y-1">
          {/* Labels de mês */}
          <div className="flex gap-[3px] mb-1">
            {weeks.map((_, wi) => (
              <div
                key={wi}
                className="w-3 flex-shrink-0 font-pixel text-[7px] text-[#7f7f9f] overflow-visible"
                style={{ lineHeight: "12px" }}
              >
                {monthLabels[wi] ?? ""}
              </div>
            ))}
          </div>

          {/* Grade */}
          <div className="flex gap-[3px]">
            <TooltipProvider delayDuration={100}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) =>
                    cell.count === -1 ? (
                      <div key={di} className="w-3 h-3" />
                    ) : (
                      <Tooltip key={di}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-3 h-3 cursor-default transition-transform hover:scale-125"
                            style={{
                              background: getColor(cell.minutes),
                              border: "1px solid rgba(255,255,255,0.05)",
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="font-pixel text-[7px]">
                            {cell.date}
                            {cell.minutes > 0
                              ? ` · ${cell.minutes}min · ${cell.count} sessão${cell.count !== 1 ? "ões" : ""}`
                              : " · sem estudo"}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    ),
                  )}
                </div>
              ))}
            </TooltipProvider>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="font-pixel text-[7px] text-[#7f7f9f]">Menos</span>
            {["#1a1a2e", "#003b1a", "#006b1a", "#00bb2d", "#00ff41"].map(
              (color) => (
                <div
                  key={color}
                  className="w-3 h-3"
                  style={{
                    background: color,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                />
              ),
            )}
            <span className="font-pixel text-[7px] text-[#7f7f9f]">Mais</span>
          </div>
        </div>
      </div>
    </div>
  );
}
