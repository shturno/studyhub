"use client";

import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { usePlannerCalendar } from "./usePlannerCalendar";
import type { PlannerCalendarProps } from "./types";
import type { PlannedSession, ContestSummary } from "@/features/study-cycle/types";

// ── Contest colour palette ─────────────────────────────────────────────────
const CONTEST_COLORS = [
  "#7b61ff", // purple
  "#00c8ff", // cyan
  "#ff6b6b", // red
  "#ffd166", // yellow
  "#06d6a0", // teal
  "#ff9f1c", // orange
  "#e040fb", // pink
  "#69db7c", // green
];

function buildContestColorMap(
  contests: ContestSummary[],
): Map<string, string> {
  const map = new Map<string, string>();
  contests.forEach((c, idx) => {
    map.set(c.id, CONTEST_COLORS[idx % CONTEST_COLORS.length]);
  });
  return map;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatWeekLabel(weekStartIso: string): string {
  const start = new Date(weekStartIso + "T12:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "pt-BR",
    { month: "long", year: "numeric" },
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export function PlannerCalendar({ sessions, contests = [] }: PlannerCalendarProps) {
  const colorMap = buildContestColorMap(contests);
  const {
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    sessionsByMonth,
    sessionsByWeek,
    sessionsByDateComplete,
    sessionsForDay,
    totalDays,
    totalHours,
    sessionsByDate,
  } = usePlannerCalendar(sessions);

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  const tabs: { key: typeof viewMode; label: string }[] = [
    { key: "semanal", label: "SEMANAL" },
    { key: "mensal", label: "MENSAL" },
    { key: "completo", label: "CRONOGRAMA" },
  ];

  const emptyState = (
    <div className="p-6 text-center">
      <div className="font-pixel text-[8px] text-[#555]">SEM DADOS</div>
    </div>
  );

  return (
    <div
      className="mt-6"
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#00ff41]" />
          <span className="font-pixel text-[8px] text-[#00ff41]">
            CRONOGRAMA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#7f7f9f]" />
          <span className="font-mono text-sm text-[#7f7f9f]">
            {plural(totalDays, "dia", "dias")} —{" "}
            {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* LEFT: Calendar + day detail */}
        <div
          style={{
            border: "1px solid rgba(0,255,65,0.2)",
            background: "#020008",
          }}
        >
          <div
            className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
            style={{ borderBottom: "1px solid rgba(0,255,65,0.1)" }}
          >
            CALENDÁRIO
          </div>
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
            />
          </div>

          {/* Selected day detail */}
          {selectedDateStr && (
            <div
              className="px-4 py-3"
              style={{ borderTop: "1px solid rgba(0,255,65,0.1)" }}
            >
              <div className="font-pixel text-[7px] text-[#00ff41] mb-2">
                {selectedDate?.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
              <div className="space-y-2">
                {sessionsForDay.length > 0 ? (
                  sessionsForDay.map((s: PlannedSession) => {
                    const contestColor = s.contestId
                      ? (colorMap.get(s.contestId) ?? "rgba(0,255,65,0.1)")
                      : "rgba(0,255,65,0.1)";
                    return (
                      <div
                        key={s.id}
                        className="font-mono p-2"
                        style={{
                          border: "1px solid rgba(0,255,65,0.1)",
                          borderLeft: `3px solid ${contestColor}`,
                        }}
                      >
                        <div className="text-sm text-[#e0e0ff]">
                          {s.lessonTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#7f7f9f]">
                            {s.trackName} · {s.duration} min
                          </span>
                          {s.contestName && (
                            <span
                              className="font-mono text-[10px] px-1"
                              style={{
                                background: `${contestColor}22`,
                                color: contestColor,
                                border: `1px solid ${contestColor}44`,
                              }}
                            >
                              {s.contestName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs font-mono text-[#555]">
                    Sem sessões neste dia
                  </div>
                )}
              </div>
            </div>
          )}

          {sessionsByDate.size === 0 && (
            <div
              className="m-4 p-4 text-center"
              style={{ border: "2px dashed rgba(0,255,65,0.15)" }}
            >
              <div className="font-pixel text-[8px] text-[#555] mb-1">
                NENHUMA SESSÃO PLANEJADA
              </div>
              <div className="font-mono text-xs text-[#555]">
                Arraste lições ou importe um cronograma
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: view tabs + grouped list */}
        <div className="flex flex-col gap-3">
          {/* Pixel-style tab bar */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const active = viewMode === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key)}
                  className="font-pixel text-[6px] px-3 py-2 transition-all"
                  style={{
                    border: `1px solid ${active ? "#00ff41" : "rgba(0,255,65,0.25)"}`,
                    background: active ? "#00ff41" : "transparent",
                    color: active ? "#000" : "#00ff41",
                    boxShadow: active
                      ? "0 0 8px rgba(0,255,65,0.4)"
                      : undefined,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div
            className="overflow-y-auto max-h-[420px] flex-1"
            style={{
              border: "1px solid rgba(0,255,65,0.2)",
              background: "#020008",
            }}
          >
            {/* SEMANAL */}
            {viewMode === "semanal" &&
              (sessionsByWeek.length > 0 ? (
                sessionsByWeek.map(([weekStartIso, entries]) => {
                  const totalMins = entries.reduce(
                    (sum, e) =>
                      sum + e.sessions.reduce((s, ss) => s + ss.duration, 0),
                    0,
                  );
                  return (
                    <div
                      key={weekStartIso}
                      style={{ borderBottom: "1px solid rgba(0,255,65,0.08)" }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2"
                        style={{
                          borderBottom: "1px solid rgba(0,255,65,0.08)",
                          background: "rgba(0,255,65,0.03)",
                        }}
                      >
                        <span className="font-pixel text-[6px] text-[#00ff41]">
                          {formatWeekLabel(weekStartIso)}
                        </span>
                        <span className="font-mono text-[11px] text-[#7f7f9f]">
                          {(totalMins / 60).toFixed(1)}h
                        </span>
                      </div>
                      {entries.map((entry) => {
                        const entryMins = entry.sessions.reduce(
                          (sum, s) => sum + s.duration,
                          0,
                        );
                        return (
                          <div
                            key={entry.dateStr}
                            className="px-4 py-3"
                            style={{
                              borderBottom: "1px solid rgba(0,255,65,0.05)",
                            }}
                          >
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="font-mono text-xs text-[#e0e0ff]">
                                {formatDate(entry.dateStr)}
                              </span>
                              <span className="font-mono text-[11px] text-[#7f7f9f]">
                                {(entryMins / 60).toFixed(1)}h
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {entry.sessions.map((s) => {
                                const contestColor = s.contestId
                                  ? (colorMap.get(s.contestId) ?? "rgba(0,255,65,0.2)")
                                  : "rgba(0,255,65,0.2)";
                                return (
                                  <div
                                    key={s.id}
                                    className="font-mono px-2 py-1.5"
                                    style={{
                                      border: "1px solid rgba(0,255,65,0.1)",
                                      borderLeft: `3px solid ${contestColor}`,
                                    }}
                                  >
                                    <div className="text-xs text-[#e0e0ff] truncate">
                                      {s.lessonTitle}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] text-[#555]">
                                        {s.trackName} · {s.duration} min
                                      </span>
                                      {s.contestName && (
                                        <span
                                          className="font-mono text-[10px] px-1"
                                          style={{
                                            background: `${contestColor}22`,
                                            color: contestColor,
                                            border: `1px solid ${contestColor}44`,
                                          }}
                                        >
                                          {s.contestName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                emptyState
              ))}

            {/* MENSAL */}
            {viewMode === "mensal" &&
              (sessionsByMonth.length > 0 ? (
                sessionsByMonth.map(([monthKey, entries]) => {
                  const totalMins = entries.reduce(
                    (sum, e) =>
                      sum + e.sessions.reduce((s, ss) => s + ss.duration, 0),
                    0,
                  );
                  return (
                    <div
                      key={monthKey}
                      style={{ borderBottom: "1px solid rgba(0,255,65,0.08)" }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2"
                        style={{
                          borderBottom: "1px solid rgba(0,255,65,0.08)",
                          background: "rgba(0,255,65,0.03)",
                        }}
                      >
                        <span className="font-pixel text-[6px] text-[#00ff41] capitalize">
                          {formatMonthLabel(monthKey)}
                        </span>
                        <span className="font-mono text-[11px] text-[#7f7f9f]">
                          {plural(entries.length, "dia", "dias")} ·{" "}
                          {(totalMins / 60).toFixed(1)}h
                        </span>
                      </div>
                      {entries.map((entry) => {
                        const entryMins = entry.sessions.reduce(
                          (sum, s) => sum + s.duration,
                          0,
                        );
                        return (
                          <div
                            key={entry.dateStr}
                            className="px-4 py-3"
                            style={{
                              borderBottom: "1px solid rgba(0,255,65,0.05)",
                            }}
                          >
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="font-mono text-xs text-[#e0e0ff]">
                                {formatDate(entry.dateStr)}
                              </span>
                              <span className="font-mono text-[11px] text-[#7f7f9f]">
                                {(entryMins / 60).toFixed(1)}h
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {entry.sessions.map((s) => {
                                const contestColor = s.contestId
                                  ? (colorMap.get(s.contestId) ?? "rgba(0,255,65,0.2)")
                                  : "rgba(0,255,65,0.2)";
                                return (
                                  <div
                                    key={s.id}
                                    className="font-mono px-2 py-1.5"
                                    style={{
                                      border: "1px solid rgba(0,255,65,0.1)",
                                      borderLeft: `3px solid ${contestColor}`,
                                    }}
                                  >
                                    <div className="text-xs text-[#e0e0ff] truncate">
                                      {s.lessonTitle}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] text-[#555]">
                                        {s.trackName} · {s.duration} min
                                      </span>
                                      {s.contestName && (
                                        <span
                                          className="font-mono text-[10px] px-1"
                                          style={{
                                            background: `${contestColor}22`,
                                            color: contestColor,
                                            border: `1px solid ${contestColor}44`,
                                          }}
                                        >
                                          {s.contestName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                emptyState
              ))}

            {/* CRONOGRAMA */}
            {viewMode === "completo" &&
              (sessionsByDateComplete.length > 0 ? (
                sessionsByDateComplete.map((entry) => {
                  const mins = entry.sessions.reduce(
                    (sum, s) => sum + s.duration,
                    0,
                  );
                  return (
                    <div
                      key={entry.dateStr}
                      className="px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(0,255,65,0.08)",
                      }}
                    >
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-pixel text-[6px] text-[#00ff41]">
                          {formatDate(entry.dateStr)}
                        </span>
                        <span className="font-mono text-[11px] text-[#7f7f9f]">
                          {(mins / 60).toFixed(1)}h
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {entry.sessions.map((s) => {
                          const contestColor = s.contestId
                            ? (colorMap.get(s.contestId) ?? "rgba(0,255,65,0.2)")
                            : "rgba(0,255,65,0.2)";
                          return (
                            <div
                              key={s.id}
                              className="font-mono px-2 py-1.5"
                              style={{
                                border: "1px solid rgba(0,255,65,0.1)",
                                borderLeft: `3px solid ${contestColor}`,
                              }}
                            >
                              <div className="text-xs text-[#e0e0ff] truncate">
                                {s.lessonTitle}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-[#555]">
                                  {s.trackName} · {s.duration} min
                                </span>
                                {s.contestName && (
                                  <span
                                    className="font-mono text-[10px] px-1"
                                    style={{
                                      background: `${contestColor}22`,
                                      color: contestColor,
                                      border: `1px solid ${contestColor}44`,
                                    }}
                                  >
                                    {s.contestName}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                emptyState
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

