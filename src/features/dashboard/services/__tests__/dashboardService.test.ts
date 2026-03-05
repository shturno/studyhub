import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockUserFindUnique,
  mockContestFindFirst,
  mockContestFindUnique,
  mockTopicFindUnique,
  mockSessionFindMany,
  mockGetTranslations,
  mockCalculateLevel,
  mockGetStudyRecommendations,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockContestFindFirst: vi.fn(),
  mockContestFindUnique: vi.fn(),
  mockTopicFindUnique: vi.fn(),
  mockSessionFindMany: vi.fn(),
  mockGetTranslations: vi.fn(),
  mockCalculateLevel: vi.fn(),
  mockGetStudyRecommendations: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    contest: {
      findFirst: mockContestFindFirst,
      findUnique: mockContestFindUnique,
    },
    topic: { findUnique: mockTopicFindUnique },
    studySession: { findMany: mockSessionFindMany },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock("@/features/gamification/utils/xpCalculator", () => ({
  calculateLevel: mockCalculateLevel,
}));

vi.mock("@/features/ai/services/aiAdvisoryService", () => ({
  getStudyRecommendations: mockGetStudyRecommendations,
}));

import { getDashboardData } from "../dashboardService";

const USER_ID = "user-1";
const CONTEST_ID = "contest-1";

const baseUser = { id: USER_ID, name: "Estudante", xp: 100, level: 1 };

const emptyContest = { id: CONTEST_ID, name: "Concurso", subjects: [] };

const mockTranslate = vi.fn((key: string) => key);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTranslations.mockResolvedValue(mockTranslate);
  mockCalculateLevel.mockReturnValue(1);
  mockGetStudyRecommendations.mockResolvedValue([]);
  mockUserFindUnique.mockResolvedValue(baseUser);
  mockContestFindFirst.mockResolvedValue(emptyContest);
  mockContestFindUnique.mockResolvedValue(emptyContest);
  mockTopicFindUnique.mockResolvedValue(null);
  mockSessionFindMany.mockResolvedValue([]);
});

describe("getDashboardData", () => {
  describe("contest selection without contestId", () => {
    it("calls contest.findFirst with isPrimary desc + createdAt desc when no contestId", async () => {
      await getDashboardData(USER_ID);
      expect(mockContestFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        }),
      );
    });

    it("does NOT call findUnique when no contestId provided", async () => {
      await getDashboardData(USER_ID);
      expect(mockContestFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("contest selection with contestId", () => {
    it("calls contest.findUnique with id and userId when contestId provided", async () => {
      await getDashboardData(USER_ID, CONTEST_ID);
      expect(mockContestFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: CONTEST_ID, userId: USER_ID },
        }),
      );
    });

    it("does NOT call findFirst when contestId is provided", async () => {
      await getDashboardData(USER_ID, CONTEST_ID);
      expect(mockContestFindFirst).not.toHaveBeenCalled();
    });

    it("returns coveragePercent 0 when contest not found for contestId", async () => {
      mockContestFindUnique.mockResolvedValue(null);
      const result = await getDashboardData(USER_ID, CONTEST_ID);
      expect(result.coveragePercent).toBe(0);
    });
  });

  describe("coveragePercent calculation", () => {
    it("computes coveragePercent correctly from studied topics", async () => {
      const contestWithTopics = {
        id: CONTEST_ID,
        name: "Concurso",
        subjects: [
          {
            topics: [
              { id: "t1", studySessions: [{ id: "s1" }] },
              { id: "t2", studySessions: [] },
              { id: "t3", studySessions: [{ id: "s2" }] },
              { id: "t4", studySessions: [] },
            ],
          },
        ],
      };
      mockContestFindFirst.mockResolvedValue(contestWithTopics);
      const result = await getDashboardData(USER_ID);
      expect(result.coveragePercent).toBe(50);
    });
  });
});
