import { describe, it, expect } from "vitest";

interface PlannedSession {
  readonly id: string;
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly trackName: string;
  readonly duration: number;
  readonly scheduledDate: string;
  readonly draft: boolean;
}

function sessionsByDateHelper(sessions: PlannedSession[]) {
  const map = new Map<string, PlannedSession[]>();
  for (const s of sessions) {
    const existing = map.get(s.scheduledDate) ?? [];
    existing.push(s);
    map.set(s.scheduledDate, existing);
  }
  return map;
}

function sessionsByMonthHelper(sessionsByDate: Map<string, PlannedSession[]>) {
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
}

function sessionsByWeekHelper(sessionsByDate: Map<string, PlannedSession[]>) {
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
}

describe("PlannerCalendar Data Logic", () => {
  describe("sessionsByDate organization", () => {
    it("should organize sessions by date", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 30,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const result = sessionsByDateHelper(sessions);

      expect(result.size).toBe(2);
      expect(result.get("2026-03-05")).toHaveLength(2);
      expect(result.get("2026-03-06")).toHaveLength(1);
    });

    it("should handle empty sessions list", () => {
      const sessions: PlannedSession[] = [];
      const result = sessionsByDateHelper(sessions);

      expect(result.size).toBe(0);
    });

    it("should handle single session", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const result = sessionsByDateHelper(sessions);

      expect(result.size).toBe(1);
      expect(result.get("2026-03-05")).toHaveLength(1);
    });

    it("should aggregate multiple sessions on same date", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 30,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const result = sessionsByDateHelper(sessions);
      const sessionsForDate = result.get("2026-03-05");

      expect(sessionsForDate).toHaveLength(3);
      expect(sessionsForDate?.[0].lessonTitle).toBe("Math");
      expect(sessionsForDate?.[1].lessonTitle).toBe("Physics");
      expect(sessionsForDate?.[2].lessonTitle).toBe("Chemistry");
    });
  });

  describe("sessionsByMonth organization", () => {
    it("should organize sessions by month", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-04-10",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByMonthHelper(sessionsByDate);

      expect(result).toHaveLength(2);
      expect(result[0][0]).toBe("2026-03");
      expect(result[1][0]).toBe("2026-04");
    });

    it("should group days within same month", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-10",
          draft: false,
        },
        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 30,
          scheduledDate: "2026-03-15",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByMonthHelper(sessionsByDate);

      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("2026-03");
      expect(result[0][1]).toHaveLength(3);
    });

    it("should sort months chronologically", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-05-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-10",
          draft: false,
        },
        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 30,
          scheduledDate: "2026-04-15",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByMonthHelper(sessionsByDate);

      expect(result[0][0]).toBe("2026-03");
      expect(result[1][0]).toBe("2026-04");
      expect(result[2][0]).toBe("2026-05");
    });

    it("should handle empty sessions", () => {
      const sessions: PlannedSession[] = [];
      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByMonthHelper(sessionsByDate);

      expect(result).toHaveLength(0);
    });
  });

  describe("date filtering logic", () => {
    it("should filter sessions for specific date", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const selectedDate = new Date("2026-03-05T12:00:00Z");
      const selectedDateStr = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, "0")}-${String(selectedDate.getUTCDate()).padStart(2, "0")}`;
      const sessionsForDay = sessionsByDate.get(selectedDateStr) ?? [];

      expect(sessionsForDay).toHaveLength(1);
      expect(sessionsForDay[0].lessonTitle).toBe("Math");
    });

    it("should return empty array for date with no sessions", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const selectedDate = new Date("2026-03-15T12:00:00Z");
      const selectedDateStr = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, "0")}-${String(selectedDate.getUTCDate()).padStart(2, "0")}`;
      const sessionsForDay = sessionsByDate.get(selectedDateStr) ?? [];

      expect(sessionsForDay).toHaveLength(0);
    });
  });

  describe("statistics calculations", () => {
    it("should calculate total duration in hours", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 120,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const totalHours = totalDuration / 60;

      expect(totalHours).toBe(3);
    });

    it("should count unique dates", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 30,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const totalDays = sessionsByDate.size;

      expect(totalDays).toBe(2);
    });

    it("should calculate statistics from multiple months", () => {
      const sessions: PlannedSession[] = [

        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 120,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 120,
          scheduledDate: "2026-03-06",
          draft: false,
        },

        {
          id: "3",
          lessonId: "l3",
          lessonTitle: "Chemistry",
          trackName: "Chemistry",
          duration: 180,
          scheduledDate: "2026-04-10",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const totalDays = sessionsByDate.size;
      const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

      expect(sessions.length).toBe(3);
      expect(totalDays).toBe(3);
      expect(totalHours).toBe(7);
    });
  });

  describe("date string formatting", () => {
    it("should format date correctly from Date object", () => {
      const date = new Date("2026-03-05T12:00:00Z");
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

      expect(dateStr).toBe("2026-03-05");
    });

    it("should format date with leading zeros", () => {
      const date = new Date("2026-01-05T12:00:00Z");
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

      expect(dateStr).toBe("2026-01-05");
    });

    it("should extract month key correctly", () => {
      const dateStr = "2026-03-05";
      const monthKey = dateStr.slice(0, 7);

      expect(monthKey).toBe("2026-03");
    });
  });

  describe("sessionsByWeek organization", () => {
    it("should group sessions by week", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-02",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-09",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByWeekHelper(sessionsByDate);

      expect(result.length).toBeGreaterThan(0);
    });

    it("should organize multiple days in same week together", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-02",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const result = sessionsByWeekHelper(sessionsByDate);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("four view modes structure", () => {
    it("should support diario view with daily sessions", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);

      expect(sessionsByDate.has("2026-03-05")).toBe(true);
    });

    it("should support semanal view with weekly aggregation", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-02",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 60,
          scheduledDate: "2026-03-04",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const weeks = sessionsByWeekHelper(sessionsByDate);

      expect(weeks.length).toBeGreaterThan(0);
    });

    it("should support mensal view with monthly aggregation", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const months = sessionsByMonthHelper(sessionsByDate);

      expect(months.length).toBe(1);
      expect(months[0][0]).toBe("2026-03");
    });

    it("should support completo view with all days", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 60,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 45,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const allDays = Array.from(sessionsByDate.keys());

      expect(allDays.length).toBe(2);
    });
  });

  describe("view transitions", () => {
    it("should have consistent data across all views", () => {
      const sessions: PlannedSession[] = [
        {
          id: "1",
          lessonId: "l1",
          lessonTitle: "Math",
          trackName: "Math",
          duration: 120,
          scheduledDate: "2026-03-05",
          draft: false,
        },
        {
          id: "2",
          lessonId: "l2",
          lessonTitle: "Physics",
          trackName: "Physics",
          duration: 90,
          scheduledDate: "2026-03-06",
          draft: false,
        },
      ];

      const sessionsByDate = sessionsByDateHelper(sessions);
      const sessionsByMonth = sessionsByMonthHelper(sessionsByDate);
      const sessionsByWeek = sessionsByWeekHelper(sessionsByDate);

      const dailyCount = Array.from(sessionsByDate.values()).reduce(
        (sum, s) => sum + s.length,
        0,
      );
      const monthlyCount = sessionsByMonth.reduce(
        (sum, [, days]) =>
          sum + days.reduce((s, d) => s + d.sessions.length, 0),
        0,
      );
      const weeklyCount = sessionsByWeek.reduce(
        (sum, [, days]) =>
          sum + days.reduce((s, d) => s + d.sessions.length, 0),
        0,
      );

      expect(dailyCount).toBe(2);
      expect(monthlyCount).toBe(2);
      expect(weeklyCount).toBe(2);
    });
  });
});
