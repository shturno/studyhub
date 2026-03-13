import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { recordActivityEvent, getActivityFeed } from "../activityEventService";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    activityEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("activityEventService", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordActivityEvent", () => {
    it("persiste um evento de atividade", async () => {
      const event = {
        id: "event-1",
        userId,
        type: "SESSION_COMPLETED",
        metadata: { xp: 100, topicName: "Math" },
        createdAt: new Date(),
      };

      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(event as unknown);

      await recordActivityEvent(userId, "SESSION_COMPLETED", {
        xp: 100,
        topicName: "Math",
      });

      expect(prisma.activityEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          type: "SESSION_COMPLETED",
        }),
      });
    });

    it("persiste evento de streak quebrado", async () => {
      const event = {
        id: "event-2",
        userId,
        type: "STREAK_BROKEN",
        metadata: { streakLost: 7, penalty: 55 },
        createdAt: new Date(),
      };

      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(event as unknown);

      await recordActivityEvent(userId, "STREAK_BROKEN", {
        streakLost: 7,
        penalty: 55,
      });

      expect(prisma.activityEvent.create).toHaveBeenCalled();
    });

    it("persiste evento de obrigação não cumprida", async () => {
      const event = {
        id: "event-3",
        userId,
        type: "OBLIGATION_MISSED",
        metadata: { topicName: "History", penalty: 25 },
        createdAt: new Date(),
      };

      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(event as unknown);

      await recordActivityEvent(userId, "OBLIGATION_MISSED", {
        topicName: "History",
        penalty: 25,
      });

      expect(prisma.activityEvent.create).toHaveBeenCalled();
    });
  });

  describe("getActivityFeed", () => {
    it("retorna eventos em ordem decrescente de data", async () => {
      const now = new Date();
      const events = [
        {
          id: "event-1",
          userId,
          type: "SESSION_COMPLETED",
          metadata: { xp: 100 },
          createdAt: now,
        },
        {
          id: "event-2",
          userId,
          type: "STREAK_BROKEN",
          metadata: { penalty: 25 },
          createdAt: new Date(now.getTime() - 60000),
        },
        {
          id: "event-3",
          userId,
          type: "LEVEL_UP",
          metadata: { level: 5 },
          createdAt: new Date(now.getTime() - 120000),
        },
      ];

      vi.mocked(prisma.activityEvent.findMany).mockResolvedValueOnce(events as unknown);

      const result = await getActivityFeed(userId, 20);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe("SESSION_COMPLETED");
      expect(result[1].type).toBe("STREAK_BROKEN");
      expect(result[2].type).toBe("LEVEL_UP");
      expect(prisma.activityEvent.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    });

    it("retorna no máximo o limite especificado", async () => {
      const events = Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i}`,
        userId,
        type: "SESSION_COMPLETED",
        metadata: {},
        createdAt: new Date(),
      }));

      vi.mocked(prisma.activityEvent.findMany).mockResolvedValueOnce(events.slice(0, 10) as unknown);

      const result = await getActivityFeed(userId, 10);

      expect(result).toHaveLength(10);
      expect(prisma.activityEvent.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    });

    it("retorna array vazio quando não há eventos", async () => {
      vi.mocked(prisma.activityEvent.findMany).mockResolvedValueOnce([]);

      const result = await getActivityFeed(userId, 20);

      expect(result).toEqual([]);
    });
  });
});
