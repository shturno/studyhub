import { describe, it, expect } from "vitest";
import { formatMinutes, computeDailyGoalInfo } from "../dailyGoalUtils";

describe("formatMinutes", () => {
  it("formats minutes below 60 as 'Xmin'", () => {
    expect(formatMinutes(0)).toBe("0min");
    expect(formatMinutes(1)).toBe("1min");
    expect(formatMinutes(45)).toBe("45min");
    expect(formatMinutes(59)).toBe("59min");
  });

  it("formats exactly 60 minutes as '1h'", () => {
    expect(formatMinutes(60)).toBe("1h");
  });

  it("formats hours with no remainder as 'Xh'", () => {
    expect(formatMinutes(120)).toBe("2h");
    expect(formatMinutes(180)).toBe("3h");
  });

  it("formats hours with remainder as 'XhYmin'", () => {
    expect(formatMinutes(90)).toBe("1h30min");
    expect(formatMinutes(75)).toBe("1h15min");
    expect(formatMinutes(125)).toBe("2h5min");
  });
});

describe("computeDailyGoalInfo", () => {
  describe("no-goal state", () => {
    it("returns no-goal when targetMinutes is 0", () => {
      const result = computeDailyGoalInfo(0, 60);
      expect(result.state).toBe("no-goal");
      expect(result.pct).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it("returns no-goal when targetMinutes is negative", () => {
      const result = computeDailyGoalInfo(-1, 60);
      expect(result.state).toBe("no-goal");
    });
  });

  describe("complete state", () => {
    it("returns complete when studiedTodayMinutes equals targetMinutes", () => {
      const result = computeDailyGoalInfo(120, 120);
      expect(result.state).toBe("complete");
      expect(result.pct).toBe(100);
      expect(result.remaining).toBe(0);
    });

    it("returns complete when studiedTodayMinutes exceeds targetMinutes", () => {
      const result = computeDailyGoalInfo(120, 150);
      expect(result.state).toBe("complete");
      expect(result.pct).toBe(100);
      expect(result.remaining).toBe(0);
    });
  });

  describe("in-progress state", () => {
    it("returns in-progress state with correct pct and remaining", () => {
      const result = computeDailyGoalInfo(120, 60);
      expect(result.state).toBe("in-progress");
      expect(result.pct).toBe(50);
      expect(result.remaining).toBe(60);
    });

    it("rounds pct correctly", () => {
      // 1/3 of 120 = 40min = 33.33% -> rounds to 33
      const result = computeDailyGoalInfo(120, 40);
      expect(result.pct).toBe(33);
    });

    it("caps pct at 100 for values just below completion", () => {
      const result = computeDailyGoalInfo(120, 119);
      expect(result.pct).toBe(99);
      expect(result.remaining).toBe(1);
    });

    it("uses gray barColor below 40%", () => {
      const result = computeDailyGoalInfo(120, 10); // ~8%
      expect(result.barColor).toBe("#7f7f9f");
    });

    it("uses cyan barColor between 40% and 75%", () => {
      const result = computeDailyGoalInfo(120, 60); // 50%
      expect(result.barColor).toBe("#00c8ff");
    });

    it("uses green barColor at 75% or above", () => {
      const result = computeDailyGoalInfo(120, 90); // 75%
      expect(result.barColor).toBe("#00ff41");
    });

    it("returns 0 studied when no sessions today", () => {
      const result = computeDailyGoalInfo(120, 0);
      expect(result.state).toBe("in-progress");
      expect(result.pct).toBe(0);
      expect(result.remaining).toBe(120);
    });
  });
});
