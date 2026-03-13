import { describe, it, expect } from "vitest";

function parsePageRanges(rangesStr: string): number[] {
  const pages = new Set<number>();
  const parts = rangesStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((s) => Number(s.trim()));
      if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const n = Number(part);
      if (!isNaN(n) && n > 0) {
        pages.add(n);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

describe("parsePageRanges", () => {
  it("should parse single page number", () => {
    expect(parsePageRanges("5")).toEqual([5]);
  });

  it("should parse single page range", () => {
    expect(parsePageRanges("15-20")).toEqual([15, 16, 17, 18, 19, 20]);
  });

  it("should parse multiple single pages", () => {
    expect(parsePageRanges("5, 10, 15")).toEqual([5, 10, 15]);
  });

  it("should parse mix of ranges and single pages", () => {
    expect(parsePageRanges("15-20, 30, 40-42")).toEqual([
      15, 16, 17, 18, 19, 20, 30, 40, 41, 42,
    ]);
  });

  it("should handle ranges with spaces", () => {
    expect(parsePageRanges("15 - 20")).toEqual([15, 16, 17, 18, 19, 20]);
  });

  it("should deduplicate overlapping ranges", () => {
    expect(parsePageRanges("10-15, 12-20")).toEqual([
      10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });

  it("should sort result in ascending order", () => {
    expect(parsePageRanges("50, 10, 30")).toEqual([10, 30, 50]);
  });

  it("should handle single element range", () => {
    expect(parsePageRanges("10-10")).toEqual([10]);
  });

  it("should ignore invalid parts", () => {
    expect(parsePageRanges("10, abc, 20")).toEqual([10, 20]);
  });

  it("should return empty array for empty string", () => {
    expect(parsePageRanges("")).toEqual([]);
  });

  it("should ignore page 0 and negative numbers", () => {
    expect(parsePageRanges("0, 5, -3, 10")).toEqual([5, 10]);
  });

  it("should return empty array for invalid range (start > end)", () => {
    expect(parsePageRanges("20-10")).toEqual([]);
  });
});
