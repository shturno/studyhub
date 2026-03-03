"use client";

import { useMemo, useState } from "react";
import type { PlannedSession, ViewMode } from "@/features/study-cycle/types";

export function usePlannerCalendar(sessions: PlannedSession[]) {
  const [viewMode, setViewMode] = useState<ViewMode>("semanal");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, PlannedSession[]>();
    for (const s of sessions) {
      const existing = map.get(s.scheduledDate) ?? [];
      existing.push(s);
      map.set(s.scheduledDate, existing);
    }
    return map;
  }, [sessions]);

  const datesWithSessions = useMemo(
    () =>
      Array.from(sessionsByDate.keys()).map((d) => new Date(d + "T12:00:00")),
    [sessionsByDate],
  );

  const sessionsByMonth = useMemo(() => {
    const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const months = new Map<
      string,
      { dateStr: string; sessions: PlannedSession[] }[]
    >();
    for (const [dateStr, daySessions] of sorted) {
      const monthKey = dateStr.slice(0, 7);
      const existing = months.get(monthKey) ?? [];
      existing.push({ dateStr, sessions: daySessions });
      months.set(monthKey, existing);
    }
    return Array.from(months.entries());
  }, [sessionsByDate]);

  const sessionsByWeek = useMemo(() => {
    const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const weeks = new Map<
      string,
      { dateStr: string; sessions: PlannedSession[] }[]
    >();
    for (const [dateStr, daySessions] of sorted) {
      const date = new Date(dateStr + "T12:00:00");
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = `${weekStart.getFullYear()}-W${String(Math.ceil((date.getDate() - date.getDay() + 1) / 7)).padStart(2, "0")}`;

      const existing = weeks.get(weekKey) ?? [];
      existing.push({ dateStr, sessions: daySessions });
      weeks.set(weekKey, existing);
    }
    return Array.from(weeks.entries());
  }, [sessionsByDate]);

  const sessionsByDateComplete = useMemo(() => {
    const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return sorted.map(([dateStr, daySessions]) => ({
      dateStr,
      sessions: daySessions,
    }));
  }, [sessionsByDate]);

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;
  const sessionsForDay = selectedDateStr
    ? (sessionsByDate.get(selectedDateStr) ?? [])
    : [];

  const totalDays = sessionsByDate.size;
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  return {
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    sessionsByDate,
    datesWithSessions,
    sessionsByMonth,
    sessionsByWeek,
    sessionsByDateComplete,
    sessionsForDay,
    totalDays,
    totalHours,
  };
}
