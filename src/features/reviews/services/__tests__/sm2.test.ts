import { describe, it, expect } from "vitest";
import { sm2 } from "../sm2";

const BASE = { interval: 1, easeFactor: 2.5, repetitions: 0 };

describe("sm2", () => {
  describe("failure (quality < 3)", () => {
    it("resets repetitions to 0 on quality 0", () => {
      const result = sm2({ ...BASE, quality: 0, repetitions: 5 });
      expect(result.nextRepetitions).toBe(0);
    });

    it("resets interval to 1 on quality 1", () => {
      const result = sm2({ ...BASE, quality: 1, interval: 10 });
      expect(result.nextInterval).toBe(1);
    });

    it("keeps easeFactor unchanged on failure", () => {
      const result = sm2({ ...BASE, quality: 2, easeFactor: 2.1 });
      expect(result.nextEaseFactor).toBe(2.1);
    });

    it("resets even after many successful repetitions", () => {
      const result = sm2({ interval: 30, easeFactor: 2.8, repetitions: 10, quality: 0 });
      expect(result.nextRepetitions).toBe(0);
      expect(result.nextInterval).toBe(1);
    });
  });

  describe("success (quality >= 3)", () => {
    it("gives interval=1 on first repetition (rep 0 → 1)", () => {
      const result = sm2({ ...BASE, quality: 4, repetitions: 0 });
      expect(result.nextInterval).toBe(1);
      expect(result.nextRepetitions).toBe(1);
    });

    it("gives interval=6 on second repetition (rep 1 → 2)", () => {
      const result = sm2({ ...BASE, quality: 4, repetitions: 1, interval: 1 });
      expect(result.nextInterval).toBe(6);
      expect(result.nextRepetitions).toBe(2);
    });

    it("multiplies interval by EF on subsequent repetitions", () => {
      const result = sm2({ interval: 6, easeFactor: 2.5, repetitions: 2, quality: 4 });
      expect(result.nextInterval).toBe(Math.round(6 * 2.5));
    });

    it("increments repetitions by 1 on success", () => {
      const result = sm2({ ...BASE, quality: 3, repetitions: 7 });
      expect(result.nextRepetitions).toBe(8);
    });
  });

  describe("EF calculation", () => {
    it("increases EF for quality 5 (perfect)", () => {
      const result = sm2({ ...BASE, quality: 5 });
      expect(result.nextEaseFactor).toBeGreaterThan(BASE.easeFactor);
    });

    it("slightly decreases EF for quality 3 (ok)", () => {
      const result = sm2({ ...BASE, quality: 3 });
      expect(result.nextEaseFactor).toBeLessThan(BASE.easeFactor);
    });

    it("decreases EF more for quality 3 than quality 4", () => {
      const resultQ3 = sm2({ ...BASE, quality: 3 });
      const resultQ4 = sm2({ ...BASE, quality: 4 });
      expect(resultQ3.nextEaseFactor).toBeLessThan(resultQ4.nextEaseFactor);
    });

    it("never allows EF below 1.3", () => {
      const result = sm2({ interval: 1, easeFactor: 1.3, repetitions: 0, quality: 3 });
      expect(result.nextEaseFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("clamps EF to minimum 1.3 when calculation drops below", () => {
      const result = sm2({ interval: 1, easeFactor: 1.31, repetitions: 0, quality: 3 });
      expect(result.nextEaseFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("scheduledFor", () => {
    it("schedules within nextInterval days from now", () => {
      const before = new Date();
      const result = sm2({ ...BASE, quality: 4 });
      const after = new Date();

      const intervalMs = result.nextInterval * 24 * 60 * 60 * 1000;
      const diffMs = result.scheduledFor.getTime() - before.getTime();

      expect(diffMs).toBeGreaterThanOrEqual(intervalMs - 1000);
      expect(result.scheduledFor.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.scheduledFor.getTime()).toBeLessThanOrEqual(after.getTime() + intervalMs + 1000);
    });

    it("schedules 1 day ahead on failure", () => {
      const result = sm2({ ...BASE, quality: 0 });
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diffMs = result.scheduledFor.getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(0);
      expect(diffMs).toBeLessThanOrEqual(oneDayMs + 2000);
    });
  });
});
