"use client";

import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { usePlannerCalendar } from "./usePlannerCalendar";
import type { PlannerCalendarProps } from "./types";
import type { PlannedSession } from "@/features/study-cycle/types";

export function PlannerCalendar({ sessions }: PlannerCalendarProps) {
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

  return (
    <div
      className="mt-6"
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
      }}
    >
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
            {totalDays} dias — {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
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
            {sessionsByDate.size > 0 && (
              <div className="mt-3 text-xs font-mono text-[#7f7f9f] space-y-1">
                {Array.from(sessionsByDate.entries())
                  .filter(([dateStr]) => {
                    const date = new Date(dateStr + "T12:00:00");
                    return (
                      date.getMonth() === currentMonth.getMonth() &&
                      date.getFullYear() === currentMonth.getFullYear()
                    );
                  })
                  .map(([dateStr, sessions]) => {
                    const date = new Date(dateStr + "T12:00:00");
                    const hours =
                      sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
                    return (
                      <div key={dateStr} className="flex justify-between">
                        <span>{date.toLocaleDateString("pt-BR")}</span>
                        <span className="text-[#00ff41]">
                          {sessions.length} • {hours.toFixed(1)}h
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {selectedDateStr && (
            <div
              className="px-4 py-3"
              style={{ borderTop: "1px solid rgba(0,255,65,0.1)" }}
            >
              <div className="font-pixel text-[7px] text-[#00ff41] mb-2">
                {selectedDate?.toLocaleDateString("pt-BR")}
              </div>
              <div className="space-y-2">
                {sessionsForDay.length > 0 ? (
                  sessionsForDay.map((s: PlannedSession) => (
                    <div
                      key={s.id}
                      className="text-xs font-mono p-2 bg-[#04000a] rounded"
                      style={{ border: "1px solid rgba(0,255,65,0.1)" }}
                    >
                      <div className="text-[#e0e0ff]">{s.lessonTitle}</div>
                      <div className="text-[#7f7f9f]">{s.duration} min</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#555]">
                    Sem sessões neste dia
                  </div>
                )}
              </div>
            </div>
          )}
          {sessionsByDate.size === 0 && (
            <div className="mt-4 p-3 border border-dashed border-[#00ff41]/30 rounded text-center">
              <div className="font-pixel text-[8px] text-[#555] mb-2">
                NENHUMA SESSÃO PLANEJADA
              </div>
              <div className="font-mono text-xs text-[#555]">
                Arraste lições ou importe um cronograma
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button
              size="sm"
              variant={viewMode === "semanal" ? "default" : "outline"}
              onClick={() => setViewMode("semanal")}
              className="text-xs"
            >
              SEMANAL
            </Button>
            <Button
              size="sm"
              variant={viewMode === "mensal" ? "default" : "outline"}
              onClick={() => setViewMode("mensal")}
              className="text-xs"
            >
              MENSAL
            </Button>
            <Button
              size="sm"
              variant={viewMode === "completo" ? "default" : "outline"}
              onClick={() => setViewMode("completo")}
              className="text-xs"
            >
              CRONOGRAMA
            </Button>
          </div>

          <div
            className="overflow-y-auto max-h-96"
            style={{
              border: "1px solid rgba(0,255,65,0.2)",
              background: "#020008",
            }}
          >
            {viewMode === "semanal" &&
              (sessionsByWeek.length > 0 ? (
                sessionsByWeek.map(([week, entries]) => (
                  <div key={week} className="border-b border-[#00ff41]/10">
                    <div className="px-4 py-2 font-pixel text-[6px] text-[#00ff41]">
                      {week}
                    </div>
                    {entries.map((entry) => (
                      <div
                        key={entry.dateStr}
                        className="px-4 py-1 text-xs font-mono text-[#7f7f9f]"
                      >
                        <div className="flex justify-between">
                          <span>{entry.dateStr}</span>
                          <span>{entry.sessions.length} sessões</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#555]">
                  <div className="font-pixel text-[8px]">SEM DADOS</div>
                </div>
              ))}
            {viewMode === "mensal" &&
              (sessionsByMonth.length > 0 ? (
                sessionsByMonth.map(([month, entries]) => (
                  <div key={month} className="border-b border-[#00ff41]/10">
                    <div className="px-4 py-2 font-pixel text-[6px] text-[#00ff41]">
                      {month}
                    </div>
                    {entries.map((entry) => (
                      <div
                        key={entry.dateStr}
                        className="px-4 py-1 text-xs font-mono text-[#7f7f9f]"
                      >
                        <div className="flex justify-between">
                          <span>{entry.dateStr}</span>
                          <span>{entry.sessions.length} sessões</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#555]">
                  <div className="font-pixel text-[8px]">SEM DADOS</div>
                </div>
              ))}
            {viewMode === "completo" &&
              (sessionsByDateComplete.length > 0 ? (
                sessionsByDateComplete.map((entry) => {
                  const hours =
                    entry.sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
                  return (
                    <div
                      key={entry.dateStr}
                      className="border-b border-[#00ff41]/10 px-4 py-3"
                    >
                      <div className="font-pixel text-[7px] text-[#00ff41] mb-2">
                        {new Date(
                          entry.dateStr + "T12:00:00",
                        ).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="space-y-1">
                        {entry.sessions.map((s) => (
                          <div
                            key={s.id}
                            className="text-xs font-mono text-[#7f7f9f] ml-2"
                          >
                            <div className="text-[#e0e0ff]">
                              {s.lessonTitle}
                            </div>
                            <div className="text-[#555]">
                              {s.trackName} • {s.duration}min
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-mono text-[#00ff41] mt-2 pt-2 border-t border-[#00ff41]/10">
                        Total: {entry.sessions.length} sessões (
                        {hours.toFixed(1)}h)
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-[#555]">
                  <div className="font-pixel text-[8px]">SEM DADOS</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
