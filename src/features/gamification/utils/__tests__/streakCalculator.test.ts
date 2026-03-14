import { describe, it, expect } from "vitest";
import {
  calculateStreak,
  getStreakMultiplier,
  getStreakTier,
} from "../streakCalculator";

// Helper para criar datas relativas ao "now" do teste
function daysAgo(n: number, from: Date = new Date("2026-03-09T12:00:00Z")): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

const NOW = new Date("2026-03-09T12:00:00Z");

describe("calculateStreak", () => {
  it("primeiro estudo: streak = 1, isNewDay = true", () => {
    const result = calculateStreak(null, 0, NOW);
    expect(result).toMatchObject({ newStreak: 1, isNewDay: true });
  });

  it("segunda sessão no mesmo dia: streak mantido, isNewDay = false", () => {
    const today = new Date("2026-03-09T08:00:00Z");
    const result = calculateStreak(today, 5, NOW);
    expect(result).toMatchObject({ newStreak: 5, isNewDay: false });
  });

  it("dia seguinte: incrementa streak, isNewDay = true", () => {
    const yesterday = daysAgo(1, NOW);
    const result = calculateStreak(yesterday, 4, NOW);
    expect(result).toMatchObject({ newStreak: 5, isNewDay: true });
  });

  it("gap de 2 dias: reseta para 1, isNewDay = true, com xpPenalty", () => {
    const twoDaysAgo = daysAgo(2, NOW);
    const result = calculateStreak(twoDaysAgo, 10, NOW);
    expect(result.newStreak).toBe(1);
    expect(result.isNewDay).toBe(true);
    expect(result.xpPenalty).toBeGreaterThan(0);
    expect(result.streakLost).toBe(10);
  });

  it("gap de 10 dias: reseta para 1, com xpPenalty capped at 150", () => {
    const tenDaysAgo = daysAgo(10, NOW);
    const result = calculateStreak(tenDaysAgo, 30, NOW);
    expect(result.newStreak).toBe(1);
    expect(result.isNewDay).toBe(true);
    // Fórmula: min(30*5 + (10-1)*10, 150) = min(150+90, 150) = 150
    expect(result.xpPenalty).toBe(150);
    expect(result.streakLost).toBe(30);
  });

  it("xpPenalty: streak de 7 dias + gap de 3 dias = min(7*5 + 2*10, 150) = 55", () => {
    const threeDaysAgo = daysAgo(3, NOW);
    const result = calculateStreak(threeDaysAgo, 7, NOW);
    expect(result.xpPenalty).toBe(55);
    expect(result.streakLost).toBe(7);
  });

  it("xpPenalty: streak de 1 dia + gap de 2 dias = min(1*5 + 1*10, 150) = 15", () => {
    const twoDaysAgo = daysAgo(2, NOW);
    const result = calculateStreak(twoDaysAgo, 1, NOW);
    expect(result.xpPenalty).toBe(15);
    expect(result.streakLost).toBe(1);
  });

  it("streak de 1 vai para 2 no dia seguinte", () => {
    const yesterday = daysAgo(1, NOW);
    const result = calculateStreak(yesterday, 1, NOW);
    expect(result.newStreak).toBe(2);
  });
});

describe("getStreakMultiplier", () => {
  it("1–6 dias: 1.0×", () => {
    expect(getStreakMultiplier(1)).toBe(1.0);
    expect(getStreakMultiplier(6)).toBe(1.0);
  });

  it("7–13 dias: 1.1×", () => {
    expect(getStreakMultiplier(7)).toBe(1.1);
    expect(getStreakMultiplier(13)).toBe(1.1);
  });

  it("14–29 dias: 1.25×", () => {
    expect(getStreakMultiplier(14)).toBe(1.25);
    expect(getStreakMultiplier(29)).toBe(1.25);
  });

  it("30+ dias: 1.5×", () => {
    expect(getStreakMultiplier(30)).toBe(1.5);
    expect(getStreakMultiplier(100)).toBe(1.5);
  });
});

describe("getStreakTier", () => {
  it("0–6: none", () => {
    expect(getStreakTier(0)).toBe("none");
    expect(getStreakTier(6)).toBe("none");
  });

  it("7–13: bronze", () => {
    expect(getStreakTier(7)).toBe("bronze");
    expect(getStreakTier(13)).toBe("bronze");
  });

  it("14–29: silver", () => {
    expect(getStreakTier(14)).toBe("silver");
    expect(getStreakTier(29)).toBe("silver");
  });

  it("30+: gold", () => {
    expect(getStreakTier(30)).toBe("gold");
    expect(getStreakTier(365)).toBe("gold");
  });
});
