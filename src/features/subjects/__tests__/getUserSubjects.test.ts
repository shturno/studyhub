import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockContestFindFirst, mockContestFindUnique } = vi.hoisted(
  () => ({
    mockAuth: vi.fn(),
    mockContestFindFirst: vi.fn(),
    mockContestFindUnique: vi.fn(),
  }),
);

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contest: {
      findFirst: mockContestFindFirst,
      findUnique: mockContestFindUnique,
    },
    subject: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getUserSubjects } from "../actions";

const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const CONTEST_ID = "contest-1";

const mockSession = { user: { id: USER_ID } };

const makeContest = (overrides = {}) => ({
  id: CONTEST_ID,
  subjects: [],
  ...overrides,
});

const makeSubject = (
  topics: { id: string; studySessions: { minutes: number }[] }[],
) => ({
  id: "subject-1",
  name: "Matemática",
  topics,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserSubjects", () => {
  describe("authentication", () => {
    it("returns err when unauthenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const result = await getUserSubjects();
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });

    it("returns err when session has no user id", async () => {
      mockAuth.mockResolvedValue({ user: {} });
      const result = await getUserSubjects();
      expect(result.success).toBe(false);
    });
  });

  describe("without contestId (fallback)", () => {
    it("returns ok([]) when no contest exists", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(null);
      const result = await getUserSubjects();
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual([]);
    });

    it("calls findFirst with isPrimary desc then createdAt asc orderBy", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(makeContest());
      await getUserSubjects();
      expect(mockContestFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        }),
      );
    });

    it("does NOT call findUnique when no contestId is provided", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(makeContest());
      await getUserSubjects();
      expect(mockContestFindUnique).not.toHaveBeenCalled();
    });

    it("returns empty array when contest has no subjects", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(makeContest({ subjects: [] }));
      const result = await getUserSubjects();
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toHaveLength(0);
    });

    it("maps a subject with zero topics to progress 0", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(
        makeContest({ subjects: [makeSubject([])] }),
      );
      const result = await getUserSubjects();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0].progress).toBe(0);
        expect(result.data[0].topicsCount).toBe(0);
        expect(result.data[0].completedTopics).toBe(0);
        expect(result.data[0].totalMinutesStudied).toBe(0);
      }
    });

    it("correctly computes SubjectStats from topics and sessions", async () => {
      const topics = [
        { id: "t1", studySessions: [] },
        { id: "t2", studySessions: [{ minutes: 30 }] },
        { id: "t3", studySessions: [{ minutes: 45 }, { minutes: 15 }] },
      ];
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindFirst.mockResolvedValue(
        makeContest({ subjects: [makeSubject(topics)] }),
      );
      const result = await getUserSubjects();
      expect(result.success).toBe(true);
      if (result.success) {
        const [stats] = result.data;
        expect(stats.id).toBe("subject-1");
        expect(stats.name).toBe("Matemática");
        expect(stats.topicsCount).toBe(3);
        expect(stats.completedTopics).toBe(2);
        expect(stats.progress).toBe(67);
        expect(stats.totalMinutesStudied).toBe(90);
      }
    });
  });

  describe("with contestId", () => {
    it("calls findUnique with contestId and userId for ownership check", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindUnique.mockResolvedValue(makeContest());
      await getUserSubjects(CONTEST_ID);
      expect(mockContestFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: CONTEST_ID, userId: USER_ID },
        }),
      );
    });

    it("does NOT call findFirst when contestId is provided", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindUnique.mockResolvedValue(makeContest());
      await getUserSubjects(CONTEST_ID);
      expect(mockContestFindFirst).not.toHaveBeenCalled();
    });

    it("returns ok([]) when contest not found (enforces ownership)", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindUnique.mockResolvedValue(null);
      const result = await getUserSubjects("other-contest-id");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual([]);
    });

    it("returns subjects when contest belongs to user", async () => {
      const topics = [{ id: "t1", studySessions: [{ minutes: 20 }] }];
      mockAuth.mockResolvedValue(mockSession);
      mockContestFindUnique.mockResolvedValue(
        makeContest({ subjects: [makeSubject(topics)] }),
      );
      const result = await getUserSubjects(CONTEST_ID);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].completedTopics).toBe(1);
        expect(result.data[0].progress).toBe(100);
        expect(result.data[0].totalMinutesStudied).toBe(20);
      }
    });
  });

  describe("cross-user isolation", () => {
    it("cannot access other user contest via contestId (prisma returns null)", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER_ID } });
      mockContestFindUnique.mockResolvedValue(null);
      const result = await getUserSubjects(CONTEST_ID);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual([]);
      expect(mockContestFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: CONTEST_ID, userId: OTHER_USER_ID },
        }),
      );
    });
  });
});
