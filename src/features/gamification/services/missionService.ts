import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MissionType =
  | "STUDY_MINUTES"
  | "COMPLETE_SESSIONS"
  | "STUDY_TOPICS"
  | "USE_PLANNED"
  | "STREAK_MAINTAIN"
  | "LONG_SESSION"
  | "MARK_TOPICS"
  | "STUDY_PRIORITY";

export interface MissionTemplate {
  type: MissionType;
  label: string;
  targetValue: number;
  xpReward: number;
}

export interface DailyMissionSummary {
  id: string;
  type: MissionType;
  label: string;
  targetValue: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

// ---------------------------------------------------------------------------
// Mission pool  (labels in pt-BR — stored at creation time)
// ---------------------------------------------------------------------------

const MISSION_POOL: MissionTemplate[] = [
  { type: "STUDY_MINUTES",      label: "Estude 30 minutos hoje",                  targetValue: 30,  xpReward: 50  },
  { type: "STUDY_MINUTES",      label: "Estude 45 minutos hoje",                  targetValue: 45,  xpReward: 75  },
  { type: "STUDY_MINUTES",      label: "Estude 60 minutos hoje",                  targetValue: 60,  xpReward: 100 },
  { type: "COMPLETE_SESSIONS",  label: "Complete 2 sessões de estudo",             targetValue: 2,   xpReward: 50  },
  { type: "COMPLETE_SESSIONS",  label: "Complete 3 sessões de estudo",             targetValue: 3,   xpReward: 80  },
  { type: "STUDY_TOPICS",       label: "Estude 2 tópicos diferentes",              targetValue: 2,   xpReward: 60  },
  { type: "STUDY_TOPICS",       label: "Estude 3 tópicos diferentes",              targetValue: 3,   xpReward: 90  },
  { type: "USE_PLANNED",        label: "Inicie uma sessão do Planner",             targetValue: 1,   xpReward: 40  },
  { type: "STREAK_MAINTAIN",    label: "Mantenha seu streak ativo hoje",           targetValue: 1,   xpReward: 30  },
  { type: "LONG_SESSION",       label: "Complete uma sessão de 25+ minutos",       targetValue: 1,   xpReward: 60  },
  { type: "MARK_TOPICS",        label: "Marque 2 tópicos como vistos",             targetValue: 2,   xpReward: 40  },
  { type: "MARK_TOPICS",        label: "Marque 3 tópicos como vistos",             targetValue: 3,   xpReward: 60  },
];

const MISSIONS_PER_DAY = 3;
const ALL_MISSIONS_BONUS_XP = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Gets today's missions for the user, creating them if they don't exist yet.
 * Ensures no two missions of the same `type` are generated on the same day.
 */
export async function getOrCreateTodayMissions(
  userId: string,
): Promise<DailyMissionSummary[]> {
  const date = todayString();

  const existing = await prisma.dailyMission.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length >= MISSIONS_PER_DAY) {
    return existing.map(toSummary);
  }

  // Avoid duplicate types within the same day
  const usedTypes = new Set(existing.map((m) => m.type as MissionType));
  const available = MISSION_POOL.filter((t) => !usedTypes.has(t.type));
  const needed = MISSIONS_PER_DAY - existing.length;
  const picked = pickRandom(available, needed);

  if (picked.length > 0) {
    await prisma.dailyMission.createMany({
      data: picked.map((t) => ({
        userId,
        date,
        type: t.type,
        label: t.label,
        targetValue: t.targetValue,
        xpReward: t.xpReward,
      })),
      skipDuplicates: true,
    });
  }

  const all = await prisma.dailyMission.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
  });
  return all.map(toSummary);
}

/**
 * Recalculates mission progress for today based on actual activity.
 * Call this after any study session is saved or topic is marked.
 */
export async function refreshMissionProgress(userId: string): Promise<void> {
  const date = todayString();
  const dayStart = startOfDay(new Date());
  const dayEnd = endOfDay(new Date());

  const missions = await prisma.dailyMission.findMany({
    where: { userId, date, completed: false },
  });

  if (missions.length === 0) return;

  // Gather today's study data once
  const [sessions, markedToday] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, completedAt: { gte: dayStart, lte: dayEnd } },
      select: { minutes: true, topicId: true },
    }),
    prisma.studySession.findMany({
      // "mark as studied" creates a 1-min session — count those as marks
      where: { userId, completedAt: { gte: dayStart, lte: dayEnd }, minutes: 1 },
      select: { topicId: true },
    }),
  ]);

  const totalMinutes = sessions.reduce((s, r) => s + r.minutes, 0);
  const sessionCount = sessions.length;
  const distinctTopics = new Set(sessions.map((s) => s.topicId)).size;
  const longSessions = sessions.filter((s) => s.minutes >= 25).length;
  const markedTopics = markedToday.length;

  // Check if the user had a study session today (for streak mission)
  const studiedToday = sessions.length > 0 ? 1 : 0;

  // Check planned session usage: look for study sessions linked to a planned session
  // (proxy: user has sessions today — good enough signal)
  const plannedSessionsStarted = await prisma.plannedSession.count({
    where: {
      userId,
      completed: true,
      scheduledDate: { gte: dayStart, lte: dayEnd },
    },
  });

  const progressMap: Record<MissionType, number> = {
    STUDY_MINUTES:     totalMinutes,
    COMPLETE_SESSIONS: sessionCount,
    STUDY_TOPICS:      distinctTopics,
    USE_PLANNED:       Math.min(plannedSessionsStarted, 1),
    STREAK_MAINTAIN:   studiedToday,
    LONG_SESSION:      Math.min(longSessions, 1),
    MARK_TOPICS:       markedTopics,
    STUDY_PRIORITY:    distinctTopics, // fallback to topics studied
  };

  for (const mission of missions) {
    const progress = progressMap[mission.type as MissionType] ?? 0;
    const clamped = Math.min(progress, mission.targetValue);
    const completed = clamped >= mission.targetValue;

    await prisma.dailyMission.update({
      where: { id: mission.id },
      data: {
        progress: clamped,
        ...(completed
          ? { completed: true, completedAt: new Date() }
          : {}),
      },
    });
  }
}

/**
 * Check if all 3 missions are completed today.
 * Returns the bonus XP amount if newly completed, 0 otherwise.
 */
export async function checkAllMissionsCompleted(
  userId: string,
): Promise<number> {
  const date = todayString();

  const missions = await prisma.dailyMission.findMany({
    where: { userId, date },
    select: { completed: true },
  });

  if (missions.length < MISSIONS_PER_DAY) return 0;
  if (!missions.every((m) => m.completed)) return 0;

  return ALL_MISSIONS_BONUS_XP;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function toSummary(m: {
  id: string;
  type: string;
  label: string;
  targetValue: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}): DailyMissionSummary {
  return {
    id: m.id,
    type: m.type as MissionType,
    label: m.label,
    targetValue: m.targetValue,
    progress: m.progress,
    completed: m.completed,
    xpReward: m.xpReward,
  };
}
