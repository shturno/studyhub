import { describe, it, expect } from "vitest";
import { computeWeeklyComparison, formatWeekMinutes } from "../weeklyComparisonUtils";
import { startOfWeek, subWeeks } from "date-fns";

const NOW = new Date("2026-03-10T12:00:00Z"); // a Tuesday
const THIS_WEEK_START = startOfWeek(NOW, { weekStartsOn: 1 }); // Mon 2026-03-09
const LAST_WEEK_START = startOfWeek(subWeeks(NOW, 1), { weekStartsOn: 1 }); // Mon 2026-03-02

describe("formatWeekMinutes", () => {
  it("returns '0min' for 0", () => {
    expect(formatWeekMinutes(0)).toBe("0min");
  });

  it("returns '0min' for negative values", () => {
    expect(formatWeekMinutes(-5)).toBe("0min");
  });

  it("formats sub-hour minutes", () => {
    expect(formatWeekMinutes(45)).toBe("45min");
  });

  it("formats exact hours without minutes part", () => {
    expect(formatWeekMinutes(120)).toBe("2h");
  });

  it("formats hours with remaining minutes", () => {
    expect(formatWeekMinutes(260)).toBe("4h 20min");
  });
});

describe("computeWeeklyComparison", () => {
  describe("empty data", () => {
    it("returns all zeros for empty input", () => {
      const result = computeWeeklyComparison([], NOW);
      expect(result.thisWeekMinutes).toBe(0);
      expect(result.lastWeekMinutes).toBe(0);
      expect(result.deltaPercent).toBe(0);
      expect(result.personalBestMinutes).toBe(0);
      expect(result.isPersonalBest).toBe(false);
    });

    it("returns 4 weeks with 0 minutes for last4Weeks when no data", () => {
      const result = computeWeeklyComparison([], NOW);
      expect(result.last4Weeks).toHaveLength(4);
      result.last4Weeks.forEach((w) => expect(w.minutes).toBe(0));
    });
  });

  describe("thisWeekMinutes", () => {
    it("picks up this week's minutes", () => {
      const raw = [{ week_start: THIS_WEEK_START, minutes: 200 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.thisWeekMinutes).toBe(200);
    });

    it("returns 0 for this week when only last week has data", () => {
      const raw = [{ week_start: LAST_WEEK_START, minutes: 180 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.thisWeekMinutes).toBe(0);
    });
  });

  describe("lastWeekMinutes", () => {
    it("picks up last week's minutes", () => {
      const raw = [{ week_start: LAST_WEEK_START, minutes: 180 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.lastWeekMinutes).toBe(180);
    });
  });

  describe("deltaPercent", () => {
    it("returns +100 when last week was 0 and this week has data", () => {
      const raw = [{ week_start: THIS_WEEK_START, minutes: 60 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.deltaPercent).toBe(100);
    });

    it("returns 0 when both weeks have 0 minutes", () => {
      const result = computeWeeklyComparison([], NOW);
      expect(result.deltaPercent).toBe(0);
    });

    it("computes positive delta correctly", () => {
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 200 },
        { week_start: LAST_WEEK_START, minutes: 100 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.deltaPercent).toBe(100); // +100%
    });

    it("computes negative delta correctly", () => {
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 60 },
        { week_start: LAST_WEEK_START, minutes: 120 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.deltaPercent).toBe(-50); // -50%
    });

    it("rounds delta to nearest integer", () => {
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 70 },
        { week_start: LAST_WEEK_START, minutes: 60 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      // (70-60)/60 = 16.67% → rounds to 17
      expect(result.deltaPercent).toBe(17);
    });
  });

  describe("personalBestMinutes", () => {
    it("is the max across all weeks in the data", () => {
      const twoWeeksAgo = startOfWeek(subWeeks(NOW, 2), { weekStartsOn: 1 });
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 200 },
        { week_start: LAST_WEEK_START, minutes: 180 },
        { week_start: twoWeeksAgo, minutes: 350 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.personalBestMinutes).toBe(350);
    });

    it("is 0 when no data", () => {
      const result = computeWeeklyComparison([], NOW);
      expect(result.personalBestMinutes).toBe(0);
    });
  });

  describe("isPersonalBest", () => {
    it("is true when this week equals the all-time max", () => {
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 300 },
        { week_start: LAST_WEEK_START, minutes: 200 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.isPersonalBest).toBe(true);
    });

    it("is false when this week is below the all-time max", () => {
      const twoWeeksAgo = startOfWeek(subWeeks(NOW, 2), { weekStartsOn: 1 });
      const raw = [
        { week_start: THIS_WEEK_START, minutes: 100 },
        { week_start: twoWeeksAgo, minutes: 500 },
      ];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.isPersonalBest).toBe(false);
    });

    it("is false when this week has 0 minutes", () => {
      const raw = [{ week_start: LAST_WEEK_START, minutes: 200 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.isPersonalBest).toBe(false);
    });
  });

  describe("last4Weeks", () => {
    it("returns exactly 4 items", () => {
      const result = computeWeeklyComparison([], NOW);
      expect(result.last4Weeks).toHaveLength(4);
    });

    it("last entry is this week", () => {
      const raw = [{ week_start: THIS_WEEK_START, minutes: 120 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.last4Weeks[3].minutes).toBe(120);
    });

    it("second-to-last entry is last week", () => {
      const raw = [{ week_start: LAST_WEEK_START, minutes: 90 }];
      const result = computeWeeklyComparison(raw, NOW);
      expect(result.last4Weeks[2].minutes).toBe(90);
    });

    it("entries with no sessions have 0 minutes", () => {
      const result = computeWeeklyComparison([], NOW);
      result.last4Weeks.forEach((w) => expect(w.minutes).toBe(0));
    });
  });
});
