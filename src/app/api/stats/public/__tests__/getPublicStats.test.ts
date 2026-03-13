import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAggregate, mockSubjectCount, mockUserCount } = vi.hoisted(() => ({
  mockAggregate: vi.fn(),
  mockSubjectCount: vi.fn(),
  mockUserCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    studySession: { aggregate: mockAggregate },
    subject: { count: mockSubjectCount },
    user: { count: mockUserCount },
  },
}));

import { getPublicStats } from "../getPublicStats";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPublicStats", () => {
  it("returns computed stats from prisma aggregates", async () => {
    mockAggregate.mockResolvedValue({ _sum: { minutes: 3600 }, _count: 42 });
    mockSubjectCount.mockResolvedValue(15);
    mockUserCount.mockResolvedValue(8);

    const result = await getPublicStats();

    expect(result.totalFocusHours).toBe(60);
    expect(result.totalSessions).toBe(42);
    expect(result.totalSubjects).toBe(15);
    expect(result.totalUsers).toBe(8);
  });

  it("handles null minutes sum gracefully", async () => {
    mockAggregate.mockResolvedValue({ _sum: { minutes: null }, _count: 0 });
    mockSubjectCount.mockResolvedValue(0);
    mockUserCount.mockResolvedValue(0);

    const result = await getPublicStats();

    expect(result.totalFocusHours).toBe(0);
    expect(result.totalSessions).toBe(0);
  });

  it("rounds down minutes to hours", async () => {
    mockAggregate.mockResolvedValue({ _sum: { minutes: 90 }, _count: 1 });
    mockSubjectCount.mockResolvedValue(0);
    mockUserCount.mockResolvedValue(0);

    const result = await getPublicStats();

    expect(result.totalFocusHours).toBe(2);
  });

  it("returns zeros fallback on prisma error", async () => {
    mockAggregate.mockRejectedValue(new Error("DB offline"));
    mockSubjectCount.mockResolvedValue(0);
    mockUserCount.mockResolvedValue(0);

    const result = await getPublicStats();

    expect(result).toEqual({
      totalFocusHours: 0,
      totalSessions: 0,
      totalSubjects: 0,
      totalUsers: 0,
    });
  });
});
