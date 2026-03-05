import { describe, it, expect } from "vitest";
import {
  calculateXP,
  calculateLevel,
  getXPForNextLevel,
  getLevelProgress,
  XP_PER_MINUTE,
  LEVEL_THRESHOLDS,
} from "../xpCalculator";

describe("xpCalculator", () => {
  describe("calculateXP", () => {
    it("should calculate 10 XP per minute", () => {
      expect(calculateXP(5)).toBe(50);
      expect(calculateXP(1)).toBe(10);
      expect(calculateXP(0)).toBe(0);
    });

    it("should handle large durations", () => {
      expect(calculateXP(100)).toBe(1000);
      expect(calculateXP(1000)).toBe(10000);
    });

    it("should be consistent with XP_PER_MINUTE constant", () => {
      expect(calculateXP(1)).toBe(XP_PER_MINUTE);
    });
  });

  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return correct level for threshold XP", () => {
      expect(calculateLevel(100)).toBe(2);

      expect(calculateLevel(300)).toBe(3);
    });

    it("should return correct level for XP between thresholds", () => {
      expect(calculateLevel(200)).toBe(2);

      expect(calculateLevel(450)).toBe(3);
    });

    it("should handle max level", () => {
      const maxLevel = LEVEL_THRESHOLDS.length;
      expect(calculateLevel(LEVEL_THRESHOLDS[maxLevel - 1])).toBe(maxLevel);
    });

    it("should handle XP beyond max threshold", () => {
      const maxLevel = LEVEL_THRESHOLDS.length;
      expect(calculateLevel(999999)).toBe(maxLevel);
    });
  });

  describe("getXPForNextLevel", () => {
    it("should calculate XP needed for next level", () => {
      expect(getXPForNextLevel(0, 1)).toBe(100);

      expect(getXPForNextLevel(100, 2)).toBe(200);
    });

    it("should return Infinity for max level", () => {
      const maxLevel = LEVEL_THRESHOLDS.length;
      expect(getXPForNextLevel(LEVEL_THRESHOLDS[maxLevel - 1], maxLevel)).toBe(
        Infinity,
      );
    });
  });

  describe("getLevelProgress", () => {
    it("should return 0 at start of level", () => {
      expect(getLevelProgress(100, 2)).toBe(0);
    });

    it("should return 100 at max level", () => {
      const maxLevel = LEVEL_THRESHOLDS.length;
      expect(getLevelProgress(LEVEL_THRESHOLDS[maxLevel - 1], maxLevel)).toBe(
        100,
      );
    });

    it("should return progress between thresholds", () => {
      expect(getLevelProgress(200, 2)).toBe(50);
    });

    it("should return 100 for max level", () => {
      const maxLevel = LEVEL_THRESHOLDS.length;
      expect(getLevelProgress(LEVEL_THRESHOLDS[maxLevel - 1], maxLevel)).toBe(
        100,
      );
    });

    it("should floor progress to integer", () => {
      expect(getLevelProgress(150, 2)).toBe(25);

      expect(getLevelProgress(175, 2)).toBe(37);
    });
  });

  describe("Level progression", () => {
    it("should progress through levels with consistent gaming", () => {
      let totalXP = 0;
      let currentLevel = 1;

      totalXP += calculateXP(5) + calculateXP(5);
      currentLevel = calculateLevel(totalXP);
      expect(currentLevel).toBe(2);

      totalXP = calculateXP(5 * 6);
      currentLevel = calculateLevel(totalXP);
      expect(currentLevel).toBe(3);

      totalXP = calculateXP(5 * 12);
      currentLevel = calculateLevel(totalXP);
      expect(currentLevel).toBe(4);
    });
  });
});
