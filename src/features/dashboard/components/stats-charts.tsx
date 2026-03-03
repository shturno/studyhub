"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { Loader2 } from "lucide-react";

interface WeeklyData {
  readonly week: string;
  readonly hours: number;
}

interface TrackData {
  readonly name: string;
  readonly hours: number;
  readonly minutes: number;
}

interface StatsData {
  readonly weeklyStats: WeeklyData[];
  readonly trackDistribution: TrackData[];
}

const COLORS = [
  "#00ff41",
  "#ff006e",
  "#7b61ff",
  "#ffbe0b",
  "#00f5ff",
  "#ff7700",
  "#84cc16",
  "#f97316",
];

export function StatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json() as Promise<StatsData>)
      .then((data) => setStats(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="p-6 flex items-center justify-center h-64"
            style={{
              border: "2px solid rgba(0,255,65,0.2)",
              background: "#04000a",
            }}
          >
            <Loader2 className="h-6 w-6 text-[#00ff41] animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        style={{
          border: "2px solid rgba(0,255,65,0.4)",
          background: "#04000a",
        }}
      >
        <div
          className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
        >
          HORAS POR SEMANA
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.weeklyStats}>
              <XAxis
                dataKey="week"
                tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: unknown) =>
                  [`${value as number}h`, "Horas"] as [string, string]
                }
                labelFormatter={(label: unknown) => `Semana ${label as string}`}
                contentStyle={{
                  background: "#04000a",
                  border: "2px solid #00ff41",
                  borderRadius: 0,
                }}
                itemStyle={{ color: "#00ff41", fontFamily: "monospace" }}
                labelStyle={{
                  color: "#7f7f9f",
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="hours" fill="#00ff41" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          border: "2px solid rgba(0,255,65,0.4)",
          background: "#04000a",
        }}
      >
        <div
          className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
        >
          DISTRIBUICAO POR TRILHA
        </div>
        <div className="p-4">
          {stats.trackDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.trackDistribution.map((d, i) => ({
                    ...d,
                    fill: COLORS[i % COLORS.length],
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    value,
                  }: {
                    name?: string;
                    value?: number;
                  }) =>
                    name !== undefined && value !== undefined
                      ? `${name}: ${value}h`
                      : ""
                  }
                  outerRadius={90}
                  dataKey="hours"
                />
                <Tooltip
                  formatter={(value: unknown) =>
                    [`${value as number}h`, "Horas"] as [string, string]
                  }
                  contentStyle={{
                    background: "#04000a",
                    border: "2px solid #00ff41",
                    borderRadius: 0,
                  }}
                  itemStyle={{ color: "#00ff41", fontFamily: "monospace" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 font-mono text-base text-[#555]">
              Nenhum dado disponível ainda
            </div>
          )}
        </div>
      </div>

      {stats.trackDistribution.length > 0 && (
        <div
          className="lg:col-span-2"
          style={{
            border: "2px solid rgba(0,255,65,0.4)",
            background: "#04000a",
          }}
        >
          <div
            className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
            style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
          >
            DETALHES POR TRILHA
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}>
                  <th className="text-left pb-2 font-pixel text-[6px] text-[#555]">
                    TRILHA
                  </th>
                  <th className="text-right pb-2 font-pixel text-[6px] text-[#555]">
                    HORAS
                  </th>
                  <th className="text-right pb-2 font-pixel text-[6px] text-[#555]">
                    MIN
                  </th>
                  <th className="text-right pb-2 font-pixel text-[6px] text-[#555]">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.trackDistribution.map((track, index) => {
                  const totalMinutes = stats.trackDistribution.reduce(
                    (sum, t) => sum + t.minutes,
                    0,
                  );
                  const pct =
                    totalMinutes > 0
                      ? ((track.minutes / totalMinutes) * 100).toFixed(1)
                      : "0";
                  return (
                    <tr
                      key={track.name}
                      style={{ borderBottom: "1px solid rgba(0,255,65,0.08)" }}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 flex-shrink-0"
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-mono text-base text-[#e0e0ff]">
                            {track.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-2 font-mono text-base text-[#e0e0ff]">
                        {track.hours}h
                      </td>
                      <td className="text-right py-2 font-mono text-sm text-[#555]">
                        {track.minutes}m
                      </td>
                      <td className="text-right py-2 font-mono text-sm text-[#555]">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
