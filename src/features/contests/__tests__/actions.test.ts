import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockAuth,
  mockContestCreate,
  mockContestUpdate,
  mockContestUpdateMany,
  mockContestDelete,
  mockUnlockAchievement,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockContestCreate: vi.fn(),
  mockContestUpdate: vi.fn(),
  mockContestUpdateMany: vi.fn(),
  mockContestDelete: vi.fn(),
  mockUnlockAchievement: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contest: {
      create: mockContestCreate,
      update: mockContestUpdate,
      updateMany: mockContestUpdateMany,
      delete: mockContestDelete,
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));
vi.mock("@/features/gamification/services/achievementService", () => ({
  unlockAchievementBySlug: mockUnlockAchievement,
}));

import { createContest, updateContest, deleteContest } from "../actions";

const USER_ID = "user-1";
const CONTEST_ID = "contest-1";
const mockSession = { user: { id: USER_ID } };

const baseContestData = {
  name: "Banco do Brasil 2026",
  institution: "Cesgranrio",
  role: "Escriturário",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUnlockAchievement.mockResolvedValue(null);
  mockContestCreate.mockResolvedValue({ id: CONTEST_ID });
  mockContestUpdate.mockResolvedValue({});
  mockContestUpdateMany.mockResolvedValue({ count: 0 });
  mockContestDelete.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// createContest
// ---------------------------------------------------------------------------
describe("createContest", () => {
  describe("authentication", () => {
    it("returns error when unauthenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const result = await createContest(baseContestData);
      expect(result).toMatchObject({ error: expect.any(String) });
      expect(mockContestCreate).not.toHaveBeenCalled();
    });

    it("returns error when session has no user id", async () => {
      mockAuth.mockResolvedValue({ user: {} });
      const result = await createContest(baseContestData);
      expect(result).toMatchObject({ error: expect.any(String) });
      expect(mockContestCreate).not.toHaveBeenCalled();
    });
  });

  describe("isPrimary handling", () => {
    it("does NOT call updateMany when isPrimary is false", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest({ ...baseContestData, isPrimary: false });
      expect(mockContestUpdateMany).not.toHaveBeenCalled();
    });

    it("does NOT call updateMany when isPrimary is undefined", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest(baseContestData);
      expect(mockContestUpdateMany).not.toHaveBeenCalled();
    });

    it("calls updateMany to demote old primary when isPrimary is true", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest({ ...baseContestData, isPrimary: true });
      expect(mockContestUpdateMany).toHaveBeenCalledWith({
        where: { userId: USER_ID, isPrimary: true },
        data: { isPrimary: false },
      });
    });

    it("creates contest with isPrimary: true when provided", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest({ ...baseContestData, isPrimary: true });
      expect(mockContestCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPrimary: true }),
        }),
      );
    });

    it("creates contest with isPrimary: false when not set", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest({ ...baseContestData, isPrimary: false });
      expect(mockContestCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPrimary: false }),
        }),
      );
    });
  });

  describe("successful creation", () => {
    it("returns success with empty achievements when no achievement unlocked", async () => {
      mockAuth.mockResolvedValue(mockSession);
      mockUnlockAchievement.mockResolvedValue(null);
      const result = await createContest(baseContestData);
      expect(result).toMatchObject({ success: true, newAchievements: [] });
    });

    it("returns success with achievement when one is unlocked", async () => {
      mockAuth.mockResolvedValue(mockSession);
      const achievement = { id: "ach-1", slug: "first_contest" };
      mockUnlockAchievement.mockResolvedValue(achievement);
      const result = await createContest(baseContestData);
      expect(result).toMatchObject({ success: true, newAchievements: [achievement] });
    });

    it("generates a unique slug from the contest name", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest({ ...baseContestData, name: "Banco do Brasil 2026" });
      const call = mockContestCreate.mock.calls[0][0];
      expect(call.data.slug).toMatch(/^banco-do-brasil-2026-\d{4}$/);
    });

    it("saves userId from session", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await createContest(baseContestData);
      expect(mockContestCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: USER_ID }),
        }),
      );
    });
  });
});

// ---------------------------------------------------------------------------
// updateContest
// ---------------------------------------------------------------------------
describe("updateContest", () => {
  describe("authentication", () => {
    it("returns error when unauthenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const result = await updateContest(CONTEST_ID, { name: "Novo Nome" });
      expect(result.success).toBe(false);
      expect(mockContestUpdate).not.toHaveBeenCalled();
    });
  });

  describe("isPrimary handling", () => {
    it("does NOT call updateMany when isPrimary is false", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { isPrimary: false });
      expect(mockContestUpdateMany).not.toHaveBeenCalled();
    });

    it("does NOT call updateMany when isPrimary is not provided", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { name: "Novo Nome" });
      expect(mockContestUpdateMany).not.toHaveBeenCalled();
    });

    it("demotes other primaries when isPrimary is true, excluding self", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { isPrimary: true });
      expect(mockContestUpdateMany).toHaveBeenCalledWith({
        where: { userId: USER_ID, isPrimary: true, id: { not: CONTEST_ID } },
        data: { isPrimary: false },
      });
    });
  });

  describe("field updates", () => {
    it("updates only provided fields", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { name: "Novo Nome" });
      expect(mockContestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: "Novo Nome" }),
        }),
      );
      const call = mockContestUpdate.mock.calls[0][0];
      expect(call.data).not.toHaveProperty("institution");
      expect(call.data).not.toHaveProperty("role");
    });

    it("updates institution and role", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { institution: "FCC", role: "Analista" });
      expect(mockContestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ institution: "FCC", role: "Analista" }),
        }),
      );
    });

    it("returns success on valid update", async () => {
      mockAuth.mockResolvedValue(mockSession);
      const result = await updateContest(CONTEST_ID, { name: "Novo Nome" });
      expect(result.success).toBe(true);
    });

    it("scopes update to the authenticated user", async () => {
      mockAuth.mockResolvedValue(mockSession);
      await updateContest(CONTEST_ID, { name: "Novo Nome" });
      expect(mockContestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: CONTEST_ID, userId: USER_ID },
        }),
      );
    });
  });
});

// ---------------------------------------------------------------------------
// deleteContest
// ---------------------------------------------------------------------------
describe("deleteContest", () => {
  it("returns error when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deleteContest(CONTEST_ID);
    expect(result.success).toBe(false);
    expect(mockContestDelete).not.toHaveBeenCalled();
  });

  it("scopes delete to the authenticated user", async () => {
    mockAuth.mockResolvedValue(mockSession);
    await deleteContest(CONTEST_ID);
    expect(mockContestDelete).toHaveBeenCalledWith({
      where: { id: CONTEST_ID, userId: USER_ID },
    });
  });

  it("returns success on valid delete", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await deleteContest(CONTEST_ID);
    expect(result.success).toBe(true);
  });
});
