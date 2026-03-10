import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
const mockDailyMissions: Array<{
  id: string;
  userId: string;
  date: string;
  type: string;
  label: string;
  targetValue: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  completedAt: Date | null;
  createdAt: Date;
}> = [];

const mockStudySessions: Array<{ minutes: number; topicId: string }> = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyMission: {
      findMany: vi.fn(({ where }: { where: { userId: string; date: string; completed?: boolean } }) => {
        let results = mockDailyMissions.filter(
          (m) => m.userId === where.userId && m.date === where.date,
        );
        if (where.completed === false) {
          results = results.filter((m) => !m.completed);
        }
        return Promise.resolve(results);
      }),
      createMany: vi.fn(({ data }: { data: Array<Record<string, unknown>> }) => {
        for (const d of data) {
          mockDailyMissions.push({
            id: `mission-${mockDailyMissions.length + 1}`,
            userId: d.userId as string,
            date: d.date as string,
            type: d.type as string,
            label: d.label as string,
            targetValue: d.targetValue as number,
            progress: 0,
            completed: false,
            xpReward: d.xpReward as number,
            completedAt: null,
            createdAt: new Date(),
          });
        }
        return Promise.resolve({ count: data.length });
      }),
      update: vi.fn(({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const mission = mockDailyMissions.find((m) => m.id === where.id);
        if (mission) Object.assign(mission, data);
        return Promise.resolve(mission);
      }),
    },
    studySession: {
      findMany: vi.fn(() => Promise.resolve(mockStudySessions)),
    },
    plannedSession: {
      count: vi.fn(() => Promise.resolve(0)),
    },
  },
}));

// ---------------------------------------------------------------------------
// Import after mock
// ---------------------------------------------------------------------------
import {
  getOrCreateTodayMissions,
  refreshMissionProgress,
  checkAllMissionsCompleted,
} from "../missionService";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockDailyMissions.length = 0;
  mockStudySessions.length = 0;
  vi.clearAllMocks();
});

describe("getOrCreateTodayMissions", () => {
  it("creates exactly 3 missions on first call", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    expect(missions).toHaveLength(3);
  });

  it("does not create duplicates on second call for the same day", async () => {
    await getOrCreateTodayMissions("user-1");
    const missions = await getOrCreateTodayMissions("user-1");
    expect(missions).toHaveLength(3);
    // createMany should have been called only once
    const { prisma } = await import("@/lib/prisma");
    expect(prisma.dailyMission.createMany).toHaveBeenCalledTimes(1);
  });

  it("generates missions with different types (no duplicates)", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    const types = missions.map((m) => m.type);
    const unique = new Set(types);
    expect(unique.size).toBe(3);
  });

  it("each mission has the required fields", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    for (const m of missions) {
      expect(m).toHaveProperty("id");
      expect(m).toHaveProperty("type");
      expect(m).toHaveProperty("label");
      expect(m.targetValue).toBeGreaterThan(0);
      expect(m.xpReward).toBeGreaterThan(0);
      expect(m.progress).toBe(0);
      expect(m.completed).toBe(false);
    }
  });
});

describe("refreshMissionProgress", () => {
  it("does nothing when there are no missions", async () => {
    await expect(refreshMissionProgress("user-1")).resolves.not.toThrow();
  });

  it("marks STUDY_MINUTES mission as completed when enough minutes studied", async () => {
    // Create a STUDY_MINUTES mission with target 30
    mockDailyMissions.push({
      id: "mission-1",
      userId: "user-1",
      date: new Date().toISOString().slice(0, 10),
      type: "STUDY_MINUTES",
      label: "Estude 30 minutos hoje",
      targetValue: 30,
      progress: 0,
      completed: false,
      xpReward: 50,
      completedAt: null,
      createdAt: new Date(),
    });

    // Add 35 minutes of study sessions
    mockStudySessions.push({ minutes: 35, topicId: "topic-1" });

    await refreshMissionProgress("user-1");

    const { prisma } = await import("@/lib/prisma");
    expect(prisma.dailyMission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mission-1" },
        data: expect.objectContaining({ progress: 30, completed: true }),
      }),
    );
  });

  it("updates progress without completing when below target", async () => {
    mockDailyMissions.push({
      id: "mission-1",
      userId: "user-1",
      date: new Date().toISOString().slice(0, 10),
      type: "STUDY_MINUTES",
      label: "Estude 60 minutos hoje",
      targetValue: 60,
      progress: 0,
      completed: false,
      xpReward: 100,
      completedAt: null,
      createdAt: new Date(),
    });

    mockStudySessions.push({ minutes: 20, topicId: "topic-1" });

    await refreshMissionProgress("user-1");

    const { prisma } = await import("@/lib/prisma");
    expect(prisma.dailyMission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mission-1" },
        data: expect.objectContaining({ progress: 20 }),
      }),
    );
    const call = (prisma.dailyMission.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.data.completed).toBeUndefined();
  });

  it("counts distinct topics for STUDY_TOPICS mission", async () => {
    mockDailyMissions.push({
      id: "mission-1",
      userId: "user-1",
      date: new Date().toISOString().slice(0, 10),
      type: "STUDY_TOPICS",
      label: "Estude 2 tópicos diferentes",
      targetValue: 2,
      progress: 0,
      completed: false,
      xpReward: 60,
      completedAt: null,
      createdAt: new Date(),
    });

    mockStudySessions.push(
      { minutes: 15, topicId: "topic-A" },
      { minutes: 10, topicId: "topic-A" }, // same topic, shouldn't count twice
      { minutes: 20, topicId: "topic-B" },
    );

    await refreshMissionProgress("user-1");

    const { prisma } = await import("@/lib/prisma");
    const call = (prisma.dailyMission.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.data.progress).toBe(2);
    expect(call.data.completed).toBe(true);
  });
});

describe("checkAllMissionsCompleted", () => {
  it("returns 0 when fewer than 3 missions exist", async () => {
    mockDailyMissions.push({
      id: "mission-1",
      userId: "user-1",
      date: new Date().toISOString().slice(0, 10),
      type: "STUDY_MINUTES",
      label: "test",
      targetValue: 30,
      progress: 30,
      completed: true,
      xpReward: 50,
      completedAt: new Date(),
      createdAt: new Date(),
    });

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(0);
  });

  it("returns 0 when not all missions are completed", async () => {
    const date = new Date().toISOString().slice(0, 10);
    mockDailyMissions.push(
      { id: "m1", userId: "user-1", date, type: "STUDY_MINUTES", label: "a", targetValue: 30, progress: 30, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date() },
      { id: "m2", userId: "user-1", date, type: "COMPLETE_SESSIONS", label: "b", targetValue: 2, progress: 1, completed: false, xpReward: 50, completedAt: null, createdAt: new Date() },
      { id: "m3", userId: "user-1", date, type: "STUDY_TOPICS", label: "c", targetValue: 2, progress: 2, completed: true, xpReward: 60, completedAt: new Date(), createdAt: new Date() },
    );

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(0);
  });

  it("returns 100 bonus XP when all 3 missions are completed", async () => {
    const date = new Date().toISOString().slice(0, 10);
    mockDailyMissions.push(
      { id: "m1", userId: "user-1", date, type: "STUDY_MINUTES", label: "a", targetValue: 30, progress: 30, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date() },
      { id: "m2", userId: "user-1", date, type: "COMPLETE_SESSIONS", label: "b", targetValue: 2, progress: 2, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date() },
      { id: "m3", userId: "user-1", date, type: "STUDY_TOPICS", label: "c", targetValue: 2, progress: 2, completed: true, xpReward: 60, completedAt: new Date(), createdAt: new Date() },
    );

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(100);
  });
});
