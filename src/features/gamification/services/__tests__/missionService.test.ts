import { describe, it, expect, vi, beforeEach } from "vitest";
import { format } from "date-fns";

/** Same date logic as the service's todayString() — local timezone, not UTC */
function todayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
type MockMission = {
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
  isCore: boolean;
};

const mockDailyMissions: MockMission[] = [];
const mockStudySessions: Array<{ minutes: number; topicId: string }> = [];
const mockPlannedSessions: Array<{ topicId: string }> = [];

function applyFindManyWhere(
  all: MockMission[],
  where: Record<string, unknown>,
): MockMission[] {
  let results = [...all];
  if (where.userId) results = results.filter((m) => m.userId === where.userId);
  if (where.date)   results = results.filter((m) => m.date === where.date);
  if (where.completed === false) results = results.filter((m) => !m.completed);
  if (where.NOT) {
    const notClause = where.NOT as Record<string, unknown>;
    if (notClause.type) results = results.filter((m) => m.type !== notClause.type);
  }
  if (where.type) results = results.filter((m) => m.type === where.type);
  return results;
}

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(() => Promise.resolve({ streakDays: 0, level: 1 })),
    },
    dailyMission: {
      findMany: vi.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(applyFindManyWhere(mockDailyMissions, where)),
      ),
      findFirst: vi.fn(({ where }: { where: Record<string, unknown> }) => {
        const found = applyFindManyWhere(mockDailyMissions, where)[0] ?? null;
        return Promise.resolve(found);
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
            isCore: (d.isCore as boolean) ?? false,
          });
        }
        return Promise.resolve({ count: data.length });
      }),
      create: vi.fn(({ data }: { data: Record<string, unknown> }) => {
        const m: MockMission = {
          id: `mission-${mockDailyMissions.length + 1}`,
          userId: data.userId as string,
          date: data.date as string,
          type: data.type as string,
          label: data.label as string,
          targetValue: data.targetValue as number,
          progress: (data.progress as number) ?? 0,
          completed: (data.completed as boolean) ?? false,
          xpReward: data.xpReward as number,
          completedAt: (data.completedAt as Date | null) ?? null,
          createdAt: new Date(),
          isCore: (data.isCore as boolean) ?? false,
        };
        mockDailyMissions.push(m);
        return Promise.resolve(m);
      }),
      upsert: vi.fn(({ where, create, update }: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        const key = where.userId_date_type as { userId: string; date: string; type: string };
        const existing = mockDailyMissions.find(
          (m) => m.userId === key.userId && m.date === key.date && m.type === key.type,
        );
        if (existing) {
          Object.assign(existing, update);
          return Promise.resolve(existing);
        }
        const m: MockMission = {
          id: `mission-${mockDailyMissions.length + 1}`,
          userId: create.userId as string,
          date: create.date as string,
          type: create.type as string,
          label: create.label as string,
          targetValue: create.targetValue as number,
          progress: (create.progress as number) ?? 0,
          completed: (create.completed as boolean) ?? false,
          xpReward: create.xpReward as number,
          completedAt: (create.completedAt as Date | null) ?? null,
          createdAt: new Date(),
          isCore: (create.isCore as boolean) ?? false,
        };
        mockDailyMissions.push(m);
        return Promise.resolve(m);
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
      findMany: vi.fn(() => Promise.resolve(mockPlannedSessions)),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
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
  mockPlannedSessions.length = 0;
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

  it("core mission (STUDY_MINUTES) sempre criada em primeiro lugar", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    expect(missions[0].type).toBe("STUDY_MINUTES");
    expect(missions[0].isCore).toBe(true);
  });

  it("missão core tem targetValue = 15 minutos", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    const coreMission = missions.find((m) => m.isCore);
    expect(coreMission).toBeDefined();
    expect(coreMission?.targetValue).toBe(15);
  });

  it("apenas 1 missão é marcada como core", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    const coreMissions = missions.filter((m) => m.isCore);
    expect(coreMissions).toHaveLength(1);
  });

  it("as 2 últimas missões não são core", async () => {
    const missions = await getOrCreateTodayMissions("user-1");
    expect(missions[1].isCore).toBe(false);
    expect(missions[2].isCore).toBe(false);
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
      date: todayLocal(),
      type: "STUDY_MINUTES",
      label: "Estude 30 minutos hoje",
      targetValue: 30,
      progress: 0,
      completed: false,
      xpReward: 50,
      completedAt: null,
      createdAt: new Date(),
      isCore: false,
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
      date: todayLocal(),
      type: "STUDY_MINUTES",
      label: "Estude 60 minutos hoje",
      targetValue: 60,
      progress: 0,
      completed: false,
      xpReward: 100,
      completedAt: null,
      createdAt: new Date(),
      isCore: false,
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
      date: todayLocal(),
      type: "STUDY_TOPICS",
      label: "Estude 2 tópicos diferentes",
      targetValue: 2,
      progress: 0,
      completed: false,
      xpReward: 60,
      completedAt: null,
      createdAt: new Date(),
      isCore: false,
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
      date: todayLocal(),
      type: "STUDY_MINUTES",
      label: "test",
      targetValue: 30,
      progress: 30,
      completed: true,
      xpReward: 50,
      completedAt: new Date(),
      createdAt: new Date(),
      isCore: true,
    });

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(0);
  });

  it("returns 0 when not all missions are completed", async () => {
    const date = todayLocal();
    mockDailyMissions.push(
      { id: "m1", userId: "user-1", date, type: "STUDY_MINUTES", label: "a", targetValue: 30, progress: 30, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date(), isCore: true },
      { id: "m2", userId: "user-1", date, type: "COMPLETE_SESSIONS", label: "b", targetValue: 2, progress: 1, completed: false, xpReward: 50, completedAt: null, createdAt: new Date(), isCore: false },
      { id: "m3", userId: "user-1", date, type: "STUDY_TOPICS", label: "c", targetValue: 2, progress: 2, completed: true, xpReward: 60, completedAt: new Date(), createdAt: new Date(), isCore: false },
    );

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(0);
  });

  it("returns 100 bonus XP when all 3 missions are completed", async () => {
    const date = todayLocal();
    mockDailyMissions.push(
      { id: "m1", userId: "user-1", date, type: "STUDY_MINUTES", label: "a", targetValue: 30, progress: 30, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date(), isCore: true },
      { id: "m2", userId: "user-1", date, type: "COMPLETE_SESSIONS", label: "b", targetValue: 2, progress: 2, completed: true, xpReward: 50, completedAt: new Date(), createdAt: new Date(), isCore: false },
      { id: "m3", userId: "user-1", date, type: "STUDY_TOPICS", label: "c", targetValue: 2, progress: 2, completed: true, xpReward: 60, completedAt: new Date(), createdAt: new Date(), isCore: false },
    );

    const bonus = await checkAllMissionsCompleted("user-1");
    expect(bonus).toBe(100);
  });
});
