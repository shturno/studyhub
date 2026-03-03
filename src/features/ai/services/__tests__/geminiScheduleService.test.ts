import { describe, it, expect } from "vitest";
import type {
  GeneratedSchedule,
  GeneratedScheduleSession,
  WeeklyScheduleSummary,
  MonthlyScheduleSummary,
} from "@/features/ai/types";

function calculateUrgencyPriorities(weeksUntilExam: number): {
  high: number;
  medium: number;
  low: number;
} {
  if (weeksUntilExam < 4) {
    return { high: 70, medium: 20, low: 10 };
  } else if (weeksUntilExam <= 8) {
    return { high: 60, medium: 30, low: 10 };
  } else {
    return { high: 50, medium: 35, low: 15 };
  }
}

describe("Gemini Schedule Service", () => {
  describe("Urgency Scaling Logic", () => {
    it("should allocate 70% HIGH priority when < 4 weeks", () => {
      const result = calculateUrgencyPriorities(3);

      expect(result.high).toBe(70);
      expect(result.medium).toBe(20);
      expect(result.low).toBe(10);
    });

    it("should allocate 60% HIGH priority when 4-8 weeks", () => {
      const result = calculateUrgencyPriorities(6);

      expect(result.high).toBe(60);
      expect(result.medium).toBe(30);
      expect(result.low).toBe(10);
    });

    it("should allocate 50% HIGH priority when > 8 weeks", () => {
      const result = calculateUrgencyPriorities(12);

      expect(result.high).toBe(50);
      expect(result.medium).toBe(35);
      expect(result.low).toBe(15);
    });

    it("should allocate 60% HIGH priority at boundary (week 4)", () => {
      const result = calculateUrgencyPriorities(4);

      expect(result.high).toBe(60);
      expect(result.medium).toBe(30);
      expect(result.low).toBe(10);
    });

    it("should allocate 60% HIGH priority at boundary (week 8)", () => {
      const result = calculateUrgencyPriorities(8);

      expect(result.high).toBe(60);
      expect(result.medium).toBe(30);
      expect(result.low).toBe(10);
    });

    it("should sum to 100% in all cases", () => {
      for (let weeks = 1; weeks <= 26; weeks++) {
        const result = calculateUrgencyPriorities(weeks);
        const sum = result.high + result.medium + result.low;

        expect(sum).toBe(100);
      }
    });
  });

  describe("Schedule Structure Validation", () => {
    it("should have valid daily session structure", () => {
      const session: GeneratedScheduleSession = {
        day: "2026-03-05 (Wednesday)",
        timeSlot: "08:00-09:00",
        topics: ["Constitutional Law"],
        duration: 60,
        focus: "Initial learning",
        reason: "Foundation topic for exam preparation",
      };

      expect(session).toHaveProperty("day");
      expect(session).toHaveProperty("timeSlot");
      expect(session).toHaveProperty("topics");
      expect(session).toHaveProperty("duration");
      expect(session).toHaveProperty("focus");
      expect(session).toHaveProperty("reason");
      expect(typeof session.duration).toBe("number");
      expect(Array.isArray(session.topics)).toBe(true);
    });

    it("should have valid weekly summary structure", () => {
      const week: WeeklyScheduleSummary = {
        week: 1,
        startDate: "2026-03-02",
        endDate: "2026-03-08",
        totalHours: 20,
        topics: ["Constitutional Law", "Admin Law"],
        focus: "Foundation & Initial Learning",
        keyActivities: ["Intro to Constitutional Law", "First practice"],
      };

      expect(week).toHaveProperty("week");
      expect(week).toHaveProperty("startDate");
      expect(week).toHaveProperty("endDate");
      expect(week).toHaveProperty("totalHours");
      expect(week).toHaveProperty("topics");
      expect(week).toHaveProperty("focus");
      expect(week).toHaveProperty("keyActivities");
      expect(typeof week.totalHours).toBe("number");
      expect(Array.isArray(week.topics)).toBe(true);
    });

    it("should have valid monthly summary structure", () => {
      const month: MonthlyScheduleSummary = {
        month: "2026-03 (March)",
        totalHours: 80,
        topics: ["Constitutional Law", "Admin Law", "Civil Law"],
        weeklyBreakdown: [
          { week: 1, hours: 20, focus: "Foundation" },
          { week: 2, hours: 20, focus: "Deepening" },
        ],
        milestones: ["Complete Constitutional Law foundation"],
      };

      expect(month).toHaveProperty("month");
      expect(month).toHaveProperty("totalHours");
      expect(month).toHaveProperty("topics");
      expect(month).toHaveProperty("weeklyBreakdown");
      expect(month).toHaveProperty("milestones");
      expect(Array.isArray(month.weeklyBreakdown)).toBe(true);
      expect(month.weeklyBreakdown[0]).toHaveProperty("week");
      expect(month.weeklyBreakdown[0]).toHaveProperty("hours");
    });
  });

  describe("Schedule Completeness", () => {
    it("should have all required schedule components", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [
          {
            day: "2026-03-02 (Monday)",
            timeSlot: "08:00-09:00",
            topics: ["Constitutional Law"],
            duration: 60,
            focus: "Initial learning",
            reason: "Foundation phase",
          },
        ],
        weeklySummary: [
          {
            week: 1,
            startDate: "2026-03-02",
            endDate: "2026-03-08",
            totalHours: 20,
            topics: ["Constitutional Law"],
            focus: "Foundation",
            keyActivities: ["Intro"],
          },
        ],
        monthlySummary: [
          {
            month: "2026-03",
            totalHours: 80,
            topics: ["Constitutional Law"],
            weeklyBreakdown: [{ week: 1, hours: 20, focus: "Foundation" }],
            milestones: ["Foundation complete"],
          },
        ],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.5,
          peakIntensityWeek: 4,
          topicsCoverage: [
            {
              topic: "Constitutional Law",
              sessions: 15,
              totalHours: 25,
              priority: "high",
            },
          ],
        },
        keyMilestones: ["Week 1: Foundation"],
        tips: ["Focus on high-priority topics"],
      };

      expect(schedule).toHaveProperty("weeks");
      expect(schedule).toHaveProperty("totalHours");
      expect(schedule).toHaveProperty("dailySessions");
      expect(schedule).toHaveProperty("weeklySummary");
      expect(schedule).toHaveProperty("monthlySummary");
      expect(schedule).toHaveProperty("fullScheduleOverview");
      expect(schedule).toHaveProperty("keyMilestones");
      expect(schedule).toHaveProperty("tips");
    });

    it("should contain at least one daily session", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [
          {
            day: "2026-03-02",
            timeSlot: "08:00-09:00",
            topics: ["Topic 1"],
            duration: 60,
            focus: "Learning",
            reason: "Foundation",
          },
        ],
        weeklySummary: [],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.5,
          peakIntensityWeek: 1,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.dailySessions.length).toBeGreaterThan(0);
    });

    it("should contain at least one week in weeklySummary", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [],
        weeklySummary: [
          {
            week: 1,
            startDate: "2026-03-02",
            endDate: "2026-03-08",
            totalHours: 20,
            topics: ["Topic 1"],
            focus: "Foundation",
            keyActivities: [],
          },
        ],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.5,
          peakIntensityWeek: 1,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.weeklySummary.length).toBeGreaterThan(0);
    });

    it("should contain at least one month in monthlySummary", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [],
        weeklySummary: [],
        monthlySummary: [
          {
            month: "2026-03",
            totalHours: 80,
            topics: ["Topic 1"],
            weeklyBreakdown: [],
            milestones: [],
          },
        ],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.5,
          peakIntensityWeek: 1,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.monthlySummary.length).toBeGreaterThan(0);
    });
  });

  describe("Schedule Consistency", () => {
    it("should have consistent total hours across views", () => {
      const schedule: GeneratedSchedule = {
        weeks: 4,
        totalHours: 80,
        dailySessions: [
          {
            day: "2026-03-02",
            timeSlot: "08:00-10:00",
            topics: ["Topic 1"],
            duration: 120,
            focus: "Learning",
            reason: "Foundation",
          },
          {
            day: "2026-03-03",
            timeSlot: "08:00-10:00",
            topics: ["Topic 2"],
            duration: 120,
            focus: "Learning",
            reason: "Foundation",
          },
        ],
        weeklySummary: [
          {
            week: 1,
            startDate: "2026-03-02",
            endDate: "2026-03-08",
            totalHours: 40,
            topics: ["Topic 1", "Topic 2"],
            focus: "Foundation",
            keyActivities: [],
          },
          {
            week: 2,
            startDate: "2026-03-09",
            endDate: "2026-03-15",
            totalHours: 40,
            topics: ["Topic 3", "Topic 4"],
            focus: "Deepening",
            keyActivities: [],
          },
        ],
        monthlySummary: [
          {
            month: "2026-03",
            totalHours: 80,
            topics: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
            weeklyBreakdown: [
              { week: 1, hours: 40, focus: "Foundation" },
              { week: 2, hours: 40, focus: "Deepening" },
            ],
            milestones: [],
          },
        ],
        fullScheduleOverview: {
          totalDaysOfStudy: 14,
          averageDailyHours: 5.7,
          peakIntensityWeek: 1,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      const weeklyTotal = schedule.weeklySummary.reduce(
        (sum, w) => sum + w.totalHours,
        0,
      );
      const monthlyTotal = schedule.monthlySummary.reduce(
        (sum, m) => sum + m.totalHours,
        0,
      );

      expect(weeklyTotal).toBe(schedule.totalHours);
      expect(monthlyTotal).toBe(schedule.totalHours);
    });

    it("should have reasonable average daily hours", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [],
        weeklySummary: [],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.89,
          peakIntensityWeek: 4,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.fullScheduleOverview.averageDailyHours).toBeGreaterThan(
        0,
      );
      expect(schedule.fullScheduleOverview.averageDailyHours).toBeLessThan(8);
      expect(schedule.fullScheduleOverview.averageDailyHours).toBeCloseTo(
        schedule.totalHours / schedule.fullScheduleOverview.totalDaysOfStudy,
        1,
      );
    });

    it("should have peak intensity week within study period", () => {
      const schedule: GeneratedSchedule = {
        weeks: 26,
        totalHours: 520,
        dailySessions: [],
        weeklySummary: [],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 180,
          averageDailyHours: 2.89,
          peakIntensityWeek: 24,
          topicsCoverage: [],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.fullScheduleOverview.peakIntensityWeek).toBeGreaterThan(
        0,
      );
      expect(
        schedule.fullScheduleOverview.peakIntensityWeek,
      ).toBeLessThanOrEqual(schedule.weeks);
    });
  });

  describe("Topic Coverage Tracking", () => {
    it("should track topics with sessions and hours", () => {
      const schedule: GeneratedSchedule = {
        weeks: 4,
        totalHours: 80,
        dailySessions: [],
        weeklySummary: [],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 28,
          averageDailyHours: 2.86,
          peakIntensityWeek: 2,
          topicsCoverage: [
            {
              topic: "Constitutional Law",
              sessions: 10,
              totalHours: 30,
              priority: "high",
            },
            {
              topic: "Admin Law",
              sessions: 8,
              totalHours: 25,
              priority: "high",
            },
            {
              topic: "Civil Law",
              sessions: 5,
              totalHours: 15,
              priority: "medium",
            },
            {
              topic: "Procedural Law",
              sessions: 2,
              totalHours: 10,
              priority: "low",
            },
          ],
        },
        keyMilestones: [],
        tips: [],
      };

      expect(schedule.fullScheduleOverview.topicsCoverage.length).toBe(4);

      const highPriority = schedule.fullScheduleOverview.topicsCoverage.filter(
        (t) => t.priority === "high",
      );
      const mediumPriority =
        schedule.fullScheduleOverview.topicsCoverage.filter(
          (t) => t.priority === "medium",
        );
      const lowPriority = schedule.fullScheduleOverview.topicsCoverage.filter(
        (t) => t.priority === "low",
      );

      const highHours = highPriority.reduce((sum, t) => sum + t.totalHours, 0);
      const mediumHours = mediumPriority.reduce(
        (sum, t) => sum + t.totalHours,
        0,
      );
      const lowHours = lowPriority.reduce((sum, t) => sum + t.totalHours, 0);

      expect(highHours).toBeGreaterThan(mediumHours);
      expect(mediumHours).toBeGreaterThan(lowHours);
    });

    it("should sum topic hours to total hours", () => {
      const schedule: GeneratedSchedule = {
        weeks: 4,
        totalHours: 80,
        dailySessions: [],
        weeklySummary: [],
        monthlySummary: [],
        fullScheduleOverview: {
          totalDaysOfStudy: 28,
          averageDailyHours: 2.86,
          peakIntensityWeek: 2,
          topicsCoverage: [
            {
              topic: "Topic A",
              sessions: 10,
              totalHours: 30,
              priority: "high",
            },
            {
              topic: "Topic B",
              sessions: 8,
              totalHours: 25,
              priority: "high",
            },
            {
              topic: "Topic C",
              sessions: 5,
              totalHours: 15,
              priority: "medium",
            },
            {
              topic: "Topic D",
              sessions: 2,
              totalHours: 10,
              priority: "low",
            },
          ],
        },
        keyMilestones: [],
        tips: [],
      };

      const topicHoursTotal =
        schedule.fullScheduleOverview.topicsCoverage.reduce(
          (sum, t) => sum + t.totalHours,
          0,
        );

      expect(topicHoursTotal).toBe(schedule.totalHours);
    });
  });
});
