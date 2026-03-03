"use client"

import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

interface PlannedSession {
  readonly id: string
  readonly lessonId: string
  readonly lessonTitle: string
  readonly trackName: string
  readonly duration: number
  readonly scheduledDate: string
  readonly draft: boolean
}

interface PlannerCalendarProps {
  readonly sessions: PlannedSession[]
}

export function PlannerCalendar({ sessions }: PlannerCalendarProps) {
  const [viewMode, setViewMode] = useState<"diario" | "semanal" | "mensal" | "completo">("diario")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, PlannedSession[]>()
    for (const s of sessions) {
      const existing = map.get(s.scheduledDate) ?? []
      existing.push(s)
      map.set(s.scheduledDate, existing)
    }
    return map
  }, [sessions])

  const datesWithSessions = useMemo(
    () =>
      Array.from(sessionsByDate.keys()).map((d) => new Date(d + "T12:00:00")),
    [sessionsByDate]
  )

  const sessionsByMonth = useMemo(() => {
    const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    )

    const months = new Map<
      string,
      { dateStr: string; sessions: PlannedSession[] }[]
    >()
    for (const [dateStr, daySessions] of sorted) {
      const monthKey = dateStr.slice(0, 7)
      const existing = months.get(monthKey) ?? []
      existing.push({ dateStr, sessions: daySessions })
      months.set(monthKey, existing)
    }
    return Array.from(months.entries())
  }, [sessionsByDate])

  const sessionsByWeek = useMemo(() => {
    const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    )

    const weeks = new Map<string, { dateStr: string; sessions: PlannedSession[] }[]>()
    for (const [dateStr, daySessions] of sorted) {
      const date = new Date(dateStr + "T12:00:00")
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay() + 1)
      const weekKey = `${weekStart.getFullYear()}-W${String(Math.ceil((date.getDate() - date.getDay() + 1) / 7)).padStart(2, "0")}`

      const existing = weeks.get(weekKey) ?? []
      existing.push({ dateStr, sessions: daySessions })
      weeks.set(weekKey, existing)
    }
    return Array.from(weeks.entries())
  }, [sessionsByDate])

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null
  const sessionsForDay = selectedDateStr
    ? sessionsByDate.get(selectedDateStr) ?? []
    : []

  const totalDays = sessionsByDate.size
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60

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
          <span className="font-pixel text-[8px] text-[#7f7f9f] ml-2">
            {sessions.length} sessões · {totalDays} dias · {totalHours.toFixed(1)}h
          </span>
        </div>

        <div
          className="flex gap-1"
          style={{ border: "1px solid rgba(0,255,65,0.3)" }}
        >
          {["diario", "semanal", "mensal", "completo"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as "diario" | "semanal" | "mensal" | "completo")}
              className="px-2 py-1 font-pixel text-[7px] transition-all"
              style={
                viewMode === mode
                  ? { background: "#00ff41", color: "#04000a" }
                  : { color: "#7f7f9f" }
              }
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-[#333]" />
            <div className="font-pixel text-[7px] text-[#555]">
              NENHUMA SESSÃO PLANEJADA AINDA
            </div>
          </div>
        ) : viewMode === "diario" ? (
          <CalendarView
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            datesWithSessions={datesWithSessions}
            sessionsForDay={sessionsForDay}
          />
        ) : viewMode === "semanal" ? (
          <WeeklyView sessionsByWeek={sessionsByWeek} />
        ) : viewMode === "mensal" ? (
          <MonthlyView sessionsByMonth={sessionsByMonth} />
        ) : (
          <CompleteView sessionsByMonth={sessionsByMonth} />
        )}
      </div>
    </div>
  )
}

function CalendarView({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  datesWithSessions,
  sessionsForDay,
}: {
  currentMonth: Date
  setCurrentMonth: (d: Date) => void
  selectedDate: Date | undefined
  setSelectedDate: (d: Date | undefined) => void
  datesWithSessions: Date[]
  sessionsForDay: PlannedSession[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div
          className="inline-block"
          style={{
            border: "1px solid rgba(0,255,65,0.2)",
            padding: "1rem",
            background: "#020008",
          }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={() => false}
            modifiers={{
              hasSession: datesWithSessions,
            }}
            modifiersStyles={{
              hasSession: {
                position: "relative",
              },
            }}
            components={{
              DayButton: (props) => {
                const { day, ...rest } = props as { day: { date: Date }; [key: string]: unknown }
                const hasSession = datesWithSessions.some(
                  (d) =>
                    d.getFullYear() === day.date.getFullYear() &&
                    d.getMonth() === day.date.getMonth() &&
                    d.getDate() === day.date.getDate()
                )
                return (
                  <button
                    {...rest}
                    className="relative h-8 w-8 p-0 font-normal text-[#e0e0ff] hover:bg-[#1a0033] rounded transition-colors"
                    style={{
                      background:
                        selectedDate &&
                        selectedDate.toDateString() === day.date.toDateString()
                          ? "#00ff41"
                          : "transparent",
                      color:
                        selectedDate &&
                        selectedDate.toDateString() === day.date.toDateString()
                          ? "#04000a"
                          : "#e0e0ff",
                    }}
                  >
                    {day.date.getDate()}
                    {hasSession && (
                      <div
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 rounded-full"
                        style={{
                          width: "4px",
                          height: "4px",
                          background: "#00ff41",
                        }}
                      />
                    )}
                  </button>
                )
              },
            }}
            className="bg-transparent"
            classNames={{
              months: "w-full",
              month: "w-full",
              caption: "text-[#00ff41] font-pixel text-[8px] mb-4",
              caption_label: "text-[#00ff41] font-pixel text-[8px]",
              nav: "gap-2 mb-4",
              button_previous:
                "text-[#00ff41] border border-[rgba(0,255,65,0.3)] hover:bg-[#1a0033]",
              button_next:
                "text-[#00ff41] border border-[rgba(0,255,65,0.3)] hover:bg-[#1a0033]",
              weekday:
                "text-[#7f7f9f] font-pixel text-[6px] w-8 h-6 uppercase",
              week: "gap-1 mb-1",
            }}
          />
        </div>
      </div>

      <div>
        {sessionsForDay.length > 0 ? (
          <div>
            <div
              className="font-pixel text-[8px] text-[#00ff41] mb-3 pb-2"
              style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
            >
              {selectedDate
                ? `${selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "short",
                  })}, ${selectedDate.getDate()} de ${selectedDate.toLocaleDateString("pt-BR", { month: "long" })}`
                : "Selecione um dia"}{" "}
              · {sessionsForDay.length} sessões ·{" "}
              {(sessionsForDay.reduce((s, sess) => s + sess.duration, 0) / 60).toFixed(1)}h
            </div>
            <div className="space-y-2">
              {sessionsForDay.map((session) => (
                <div
                  key={session.id}
                  className="p-3"
                  style={{
                    border: "1px solid rgba(0,255,65,0.2)",
                    background: "#020008",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-[#e0e0ff] truncate">
                        {session.lessonTitle}
                      </div>
                      <div className="font-mono text-xs text-[#7f7f9f] truncate">
                        {session.trackName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 font-pixel text-[7px] text-[#00ff41]">
                      <Clock className="h-3 w-3" />
                      <span>{session.duration}min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="font-pixel text-[7px] text-[#555]">
              SEM SESSÕES NESTE DIA
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WeeklyView({
  sessionsByWeek,
}: {
  sessionsByWeek: Array<[string, { dateStr: string; sessions: PlannedSession[] }[]]>
}) {
  const today = new Date().toISOString().split("T")[0]

  if (sessionsByWeek.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="font-pixel text-[7px] text-[#555]">
          NENHUMA SESSÃO PLANEJADA
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessionsByWeek.map(([weekKey, daysInWeek]) => {
        const firstDate = daysInWeek[0].dateStr
        const [year, month, day] = firstDate.split("-")
        const weekStart = new Date(`${year}-${month}-${day}T12:00:00`)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        const totalSessionsInWeek = daysInWeek.reduce(
          (sum, d) => sum + d.sessions.length,
          0
        )
        const totalHoursInWeek =
          daysInWeek.reduce((sum, d) => {
            return sum + d.sessions.reduce((s, sess) => s + sess.duration, 0)
          }, 0) / 60

        return (
          <div key={weekKey}>
            <div
              className="font-pixel text-[8px] text-[#00ff41] mb-3 pb-2"
              style={{ borderBottom: "1px solid rgba(0,255,65,0.3)" }}
            >
              SEMANA {weekKey.split("-W")[1]} ({weekStart.toLocaleDateString("pt-BR")} - {weekEnd.toLocaleDateString("pt-BR")}) · {totalSessionsInWeek} sessões · {totalHoursInWeek.toFixed(1)}h
            </div>

            <div className="space-y-2">
              {daysInWeek.map(({ dateStr, sessions }) => {
                const isPast = dateStr < today
                const isToday = dateStr === today
                const date = new Date(dateStr + "T12:00:00")
                const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" })
                const dayNum = date.getDate()
                const monthNum = date.getMonth() + 1
                const dayTotalHours = sessions.reduce((s, sess) => s + sess.duration, 0) / 60

                return (
                  <div key={dateStr}>
                    <div
                      className="font-pixel text-[7px] mb-1 pb-1"
                      style={{
                        opacity: isPast ? 0.6 : 1,
                        borderLeft: isToday ? "2px solid #00ff41" : "2px solid transparent",
                        paddingLeft: isToday ? "0.5rem" : 0,
                        color: isToday ? "#00ff41" : "#e0e0ff",
                        transition: "all 0.2s",
                      }}
                    >
                      {dayName.toUpperCase()} {dayNum}/{String(monthNum).padStart(2, "0")} · {dayTotalHours.toFixed(1)}h
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4 mb-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="px-2 py-1 text-[6px] font-mono whitespace-nowrap rounded"
                          style={{
                            background: "rgba(0,255,65,0.1)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            color: "#e0e0ff",
                            opacity: isPast ? 0.6 : 1,
                          }}
                        >
                          {session.lessonTitle} · {session.duration}min
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthlyView({
  sessionsByMonth,
}: {
  sessionsByMonth: Array<[string, { dateStr: string; sessions: PlannedSession[] }[]]>
}) {
  if (sessionsByMonth.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="font-pixel text-[7px] text-[#555]">
          NENHUMA SESSÃO PLANEJADA
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessionsByMonth.map(([monthKey, daysInMonth]) => {
        const [year, month] = monthKey.split("-")
        const monthDate = new Date(parseInt(year), parseInt(month) - 1)
        const monthName = monthDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })

        const totalSessionsInMonth = daysInMonth.reduce(
          (sum, day) => sum + day.sessions.length,
          0
        )
        const totalHoursInMonth =
          daysInMonth.reduce((sum, day) => {
            return sum + day.sessions.reduce((s, sess) => s + sess.duration, 0)
          }, 0) / 60

        return (
          <div key={monthKey}>
            <div
              className="font-pixel text-[8px] text-[#00ff41] mb-3 pb-2"
              style={{ borderBottom: "1px solid rgba(0,255,65,0.3)" }}
            >
              {monthName.toUpperCase()} · {totalSessionsInMonth} sessões · {totalHoursInMonth.toFixed(1)}h
            </div>

            <div className="space-y-3 pl-4">
              {daysInMonth.map(({ dateStr, sessions }) => {
                const date = new Date(dateStr + "T12:00:00")
                const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" })
                const dayNum = date.getDate()
                const dayTotalHours = sessions.reduce((s, sess) => s + sess.duration, 0) / 60

                return (
                  <div key={dateStr}>
                    <div className="font-pixel text-[7px] text-[#e0e0ff] mb-2">
                      {dayName.toUpperCase()} {dayNum} · {dayTotalHours.toFixed(1)}h
                    </div>
                    <div className="space-y-1 mb-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="px-2 py-1 text-[6px] font-mono rounded"
                          style={{
                            background: "rgba(0,255,65,0.1)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            color: "#e0e0ff",
                          }}
                        >
                          {session.lessonTitle} ({session.trackName}) · {session.duration}min
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompleteView({
  sessionsByMonth,
}: {
  sessionsByMonth: Array<[string, { dateStr: string; sessions: PlannedSession[] }[]]>
}) {
  const today = new Date().toISOString().split("T")[0]

  if (sessionsByMonth.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="font-pixel text-[7px] text-[#555]">
          NENHUMA SESSÃO PLANEJADA
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessionsByMonth.map(([monthKey, daysInMonth]) => {
        const [year, month] = monthKey.split("-")
        const monthDate = new Date(parseInt(year), parseInt(month) - 1)
        const monthName = monthDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
        const totalSessionsInMonth = daysInMonth.reduce(
          (sum, day) => sum + day.sessions.length,
          0
        )
        const totalHoursInMonth =
          daysInMonth.reduce((sum, day) => {
            return sum + day.sessions.reduce((s, sess) => s + sess.duration, 0)
          }, 0) / 60

        return (
          <div key={monthKey}>
            <div
              className="font-pixel text-[8px] text-[#00ff41] mb-3 pb-2"
              style={{ borderBottom: "1px solid rgba(0,255,65,0.3)" }}
            >
              ══ {monthName.toUpperCase()} ══ · {totalSessionsInMonth} sessões · {totalHoursInMonth.toFixed(1)}h
            </div>

            <div className="space-y-2">
              {daysInMonth.map(({ dateStr, sessions }) => {
                const isPast = dateStr < today
                const isToday = dateStr === today
                const date = new Date(dateStr + "T12:00:00")
                const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" })
                const dayNum = date.getDate()
                const monthNum = date.getMonth() + 1
                const dayTotalHours = sessions.reduce((s, sess) => s + sess.duration, 0) / 60

                return (
                  <div key={dateStr}>
                    <div
                      className="font-pixel text-[7px] mb-1 pb-1"
                      style={{
                        opacity: isPast ? 0.6 : 1,
                        borderLeft: isToday ? "2px solid #00ff41" : "2px solid transparent",
                        paddingLeft: isToday ? "0.5rem" : 0,
                        color: isToday ? "#00ff41" : "#e0e0ff",
                        transition: "all 0.2s",
                      }}
                    >
                      ▸ {dayName.toUpperCase()} {dayNum}/{String(monthNum).padStart(2, "0")} · {dayTotalHours.toFixed(1)}h
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4 mb-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="px-2 py-1 text-[6px] font-mono whitespace-nowrap rounded"
                          style={{
                            background: "rgba(0,255,65,0.1)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            color: "#e0e0ff",
                            opacity: isPast ? 0.6 : 1,
                          }}
                        >
                          {session.lessonTitle} · {session.duration}min
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
