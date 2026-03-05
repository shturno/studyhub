import { describe, it, expect } from "vitest";

import { formatStat } from "../formatStat";

describe("formatStat", () => {
  it("returns the number as string for values below 1000", () => {
    expect(formatStat(0)).toBe("0");
    expect(formatStat(1)).toBe("1");
    expect(formatStat(999)).toBe("999");
  });

  it("formats values >= 1000 with K suffix", () => {
    expect(formatStat(1000)).toBe("1.0K");
    expect(formatStat(1500)).toBe("1.5K");
    expect(formatStat(999999)).toBe("1000.0K");
  });

  it("formats values >= 1_000_000 with M suffix", () => {
    expect(formatStat(1_000_000)).toBe("1.0M");
    expect(formatStat(2_500_000)).toBe("2.5M");
    expect(formatStat(10_000_000)).toBe("10.0M");
  });

  it("M takes priority over K", () => {
    expect(formatStat(1_100_000)).toBe("1.1M");
  });
});
