"use client";

import { Clock, Target, TrendingUp, Calendar } from "lucide-react";
import { useStatsOverview } from "./useStatsOverview";

const SKELETON_IDS = ["s1", "s2", "s3", "s4"];

const items = [
  {
    key: "totalHours",
    label: "TOTAL DE HORAS",
    sub: "tempo total de estudo",
    Icon: Clock,
    color: "#00ff41",
  },
  {
    key: "currentWeekHours",
    label: "ESTA SEMANA",
    sub: "horas estudadas",
    Icon: Calendar,
    color: "#7b61ff",
  },
  {
    key: "totalSessions",
    label: "SESSOES",
    sub: "sessões de estudo",
    Icon: Target,
    color: "#ffbe0b",
  },
  {
    key: "trackDistribution",
    label: "TRILHAS ATIVAS",
    sub: "com progresso",
    Icon: TrendingUp,
    color: "#00f5ff",
  },
] as const;

export function StatsOverview() {
  const { stats, loading, error } = useStatsOverview();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SKELETON_IDS.map((id) => (
          <div
            key={id}
            className="p-5 h-24 animate-pulse"
            style={{
              border: "2px solid rgba(0,255,65,0.15)",
              background: "#04000a",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SKELETON_IDS.map((id) => (
          <div
            key={id}
            className="p-5 h-24 flex flex-col items-center justify-center"
            style={{
              border: "2px solid rgba(255,0,110,0.15)",
              background: "#04000a",
            }}
          >
            <div className="text-[#ff006e] text-xs font-mono">Erro ao carregar</div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const values: Record<string, number> = {
    totalHours: stats.totalHours,
    currentWeekHours: stats.currentWeekHours,
    totalSessions: stats.totalSessions,
    trackDistribution: stats.trackDistribution.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map(({ key, label, sub, Icon, color }) => (
        <div
          key={key}
          className="p-4"
          style={{ border: `2px solid ${color}30`, background: "#04000a" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[6px] text-[#7f7f9f]">
              {label}
            </span>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div
            className="font-pixel text-xl mb-1"
            style={{ color, textShadow: `0 0 10px ${color}60` }}
          >
            {key === "totalHours" || key === "currentWeekHours"
              ? `${values[key]}h`
              : values[key]}
          </div>
          <div className="font-mono text-sm text-[#555]">{sub}</div>
        </div>
      ))}
    </div>
  );
}
