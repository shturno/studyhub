"use client";

import { Clock, Target, TrendingUp } from "lucide-react";

interface WeeklyStatsProps {
  readonly stats: {
    readonly minutesStudied: number;
    readonly sessionsCompleted: number;
    readonly xpEarned: number;
  };
}

export function WeeklyStats({ stats }: WeeklyStatsProps) {
  const hours = Math.floor(stats.minutesStudied / 60);
  const minutes = stats.minutesStudied % 60;

  const items = [
    {
      label: "TEMPO ESTUDADO",
      value: `${hours}h ${minutes}m`,
      sub: "esta semana",
      Icon: Clock,
      color: "#00ff41",
    },
    {
      label: "SESSOES",
      value: String(stats.sessionsCompleted),
      sub: "completadas",
      Icon: Target,
      color: "#7b61ff",
    },
    {
      label: "XP GANHO",
      value: `${stats.xpEarned} XP`,
      sub: "nesta semana",
      Icon: TrendingUp,
      color: "#ffbe0b",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map(({ label, value, sub, Icon, color }) => (
        <div
          key={label}
          className="p-4"
          style={{ border: `2px solid ${color}40`, background: "#04000a" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[6px] text-[#7f7f9f]">
              {label}
            </span>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div
            className="font-pixel text-xl mb-1"
            style={{ color, textShadow: `0 0 12px ${color}80` }}
          >
            {value}
          </div>
          <div className="font-mono text-sm text-[#555]">{sub}</div>
        </div>
      ))}
    </div>
  );
}
