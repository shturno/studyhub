import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateTodayObligation,
  completeObligation,
  applyPendingPenalties,
} from "../dailyObligationService";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyObligation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    topic: {
      findMany: vi.fn(),
    },
  },
}));

// Mock Google Generative AI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue("Prioritário para hoje"),
        },
      }),
    }),
  })),
}));

describe("dailyObligationService", () => {
  const userId = "user-123";
  const topicId = "topic-456";
  const contestId = "contest-789";
  const today = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateTodayObligation", () => {
    it("retorna obrigação existente se já criada hoje", async () => {
      const existing = {
        id: "obl-1",
        userId,
        topicId,
        contestId,
        date: today,
        completed: false,
        completedAt: null,
        xpPenalty: 25,
        penaltyApplied: false,
        aiReasoning: "Teste",
        topic: { id: topicId, name: "Test Topic", subject: { name: "Test Subject" } },
      };

      vi.mocked(prisma.dailyObligation.findUnique).mockResolvedValueOnce(existing as unknown);

      const result = await getOrCreateTodayObligation(userId, contestId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe("obl-1");
        expect(result.value.completed).toBe(false);
      }
    });

    it("cria nova obrigação se não existir", async () => {
      const newObligation = {
        id: "obl-2",
        userId,
        topicId,
        contestId,
        date: today,
        completed: false,
        completedAt: null,
        xpPenalty: 25,
        penaltyApplied: false,
        aiReasoning: "Primeira criação",
        topic: { id: topicId, name: "New Topic", subject: { name: "New Subject" } },
      };

      vi.mocked(prisma.dailyObligation.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.topic.findMany).mockResolvedValueOnce([
        { id: topicId, name: "New Topic", subject: { name: "New Subject" } },
      ] as unknown);
      vi.mocked(prisma.dailyObligation.create).mockResolvedValueOnce(newObligation as unknown);

      const result = await getOrCreateTodayObligation(userId, contestId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe("obl-2");
        expect(prisma.dailyObligation.create).toHaveBeenCalled();
      }
    });
  });

  describe("completeObligation", () => {
    it("marca obrigação como completa quando topicId bate e minutes >= 15", async () => {
      const obligation = {
        id: "obl-1",
        userId,
        topicId,
        date: today,
        completed: false,
        completedAt: null,
      };

      vi.mocked(prisma.dailyObligation.findUnique).mockResolvedValueOnce(obligation as unknown);
      vi.mocked(prisma.dailyObligation.updateMany).mockResolvedValueOnce({ count: 1 } as unknown);

      const result = await completeObligation(userId, topicId, 20);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }
    });

    it("não marca como completa quando minutes < 15", async () => {
      const obligation = {
        id: "obl-1",
        userId,
        topicId,
        date: today,
        completed: false,
      };

      vi.mocked(prisma.dailyObligation.findUnique).mockResolvedValueOnce(obligation as unknown);

      const result = await completeObligation(userId, topicId, 10);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(false);
      }
    });

    it("não marca como completa quando topicId não bate", async () => {
      const obligation = {
        id: "obl-1",
        userId,
        topicId,
        date: today,
        completed: false,
      };

      vi.mocked(prisma.dailyObligation.findUnique).mockResolvedValueOnce(obligation as unknown);

      const result = await completeObligation(userId, "different-topic", 20);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(false);
      }
    });
  });

  describe("applyPendingPenalties", () => {
    it("aplicar penalidades para dias passados não cumpridos", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const pendingObligation = {
        id: "obl-1",
        userId,
        topicId,
        date: yesterdayStr,
        completed: false,
        penaltyApplied: false,
        xpPenalty: 25,
        topic: { name: "Test Topic", subject: { name: "Test Subject" } },
      };

      vi.mocked(prisma.dailyObligation.findMany).mockResolvedValueOnce([
        pendingObligation,
      ] as unknown);
      vi.mocked(prisma.user.update).mockResolvedValueOnce({ xp: 50 } as unknown);
      vi.mocked(prisma.dailyObligation.updateMany).mockResolvedValueOnce({ count: 1 } as unknown);

      const result = await applyPendingPenalties(userId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalPenalty).toBe(25);
        expect(result.value.missedDays.length).toBe(1);
      }
    });

    it("não aplicar penalidades para obrigações já cumpridas", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const completedObligation = {
        id: "obl-1",
        userId,
        topicId,
        date: yesterdayStr,
        completed: true,
        penaltyApplied: false,
        xpPenalty: 25,
      };

      vi.mocked(prisma.dailyObligation.findMany).mockResolvedValueOnce([
        completedObligation,
      ] as unknown);

      const result = await applyPendingPenalties(userId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalPenalty).toBe(0);
      }
    });
  });
});
