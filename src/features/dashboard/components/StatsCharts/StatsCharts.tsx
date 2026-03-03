"use client";

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
import { useStatsCharts } from "./useStatsCharts";
import { COLORS } from "./types";

export function StatsCharts() {
  const { stats, loading, error } = useStatsCharts();

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

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="p-6 flex flex-col items-center justify-center h-64"
            style={{
              border: "2px solid rgba(255,0,110,0.2)",
              background: "#04000a",
            }}
          >
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-center font-mono text-sm text-[#ff006e]">
              Erro ao carregar dados
            </div>
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
                  label={(entry: { name?: string; hours?: number }) =>
                    `${entry.name}: ${entry.hours || 0}h`
                  }
                  dataKey="hours"
                />
                <Tooltip
                  formatter={(value: unknown) => `${value as number}h`}
                  labelFormatter={(label: unknown) => label as string}
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
            <div
              className="flex items-center justify-center h-64 text-[#7f7f9f]"
              style={{ borderRadius: 0 }}
            >
              Nenhum dado de trilha disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
