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

/** Internal sentinel stored in the DB to prevent double-awarding the all-done bonus. */
const BONUS_SENTINEL_TYPE = "_BONUS_AWARDED" as const;

type Difficulty = "easy" | "medium" | "hard";

export interface MissionTemplate {
  type: MissionType;
  label: string;
  targetValue: number;
  xpReward: number;
  difficulty: Difficulty;
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
// Mission pool — tiered by difficulty so harder missions appear as the user
// builds streak / level.
// ---------------------------------------------------------------------------

const MISSION_POOL: MissionTemplate[] = [
  // ── STUDY_MINUTES ──────────────────────────────────────────────────────
  { type: "STUDY_MINUTES",     difficulty: "easy",   label: "Estude 20 minutos hoje",              targetValue: 20,  xpReward: 35  },
  { type: "STUDY_MINUTES",     difficulty: "medium", label: "Estude 40 minutos hoje",              targetValue: 40,  xpReward: 65  },
  { type: "STUDY_MINUTES",     difficulty: "hard",   label: "Estude 60 minutos hoje",              targetValue: 60,  xpReward: 100 },
  // ── COMPLETE_SESSIONS ──────────────────────────────────────────────────
  { type: "COMPLETE_SESSIONS", difficulty: "easy",   label: "Complete 1 sessão de estudo",         targetValue: 1,   xpReward: 25  },
  { type: "COMPLETE_SESSIONS", difficulty: "medium", label: "Complete 2 sessões de estudo",        targetValue: 2,   xpReward: 50  },
  { type: "COMPLETE_SESSIONS", difficulty: "hard",   label: "Complete 3 sessões de estudo",        targetValue: 3,   xpReward: 80  },
  // ── STUDY_TOPICS ───────────────────────────────────────────────────────
  { type: "STUDY_TOPICS",      difficulty: "easy",   label: "Estude 1 tópico novo",                targetValue: 1,   xpReward: 30  },
  { type: "STUDY_TOPICS",      difficulty: "medium", label: "Estude 2 tópicos diferentes",         targetValue: 2,   xpReward: 60  },
  { type: "STUDY_TOPICS",      difficulty: "hard",   label: "Estude 3 tópicos diferentes",         targetValue: 3,   xpReward: 90  },
  // ── USE_PLANNED ────────────────────────────────────────────────────────
  { type: "USE_PLANNED",       difficulty: "easy",   label: "Estude um tópico do Planner hoje",    targetValue: 1,   xpReward: 40  },
  { type: "USE_PLANNED",       difficulty: "hard",   label: "Estude 2 tópicos do Planner hoje",    targetValue: 2,   xpReward: 70  },
  // ── STREAK_MAINTAIN ────────────────────────────────────────────────────
  { type: "STREAK_MAINTAIN",   difficulty: "easy",   label: "Mantenha seu streak ativo hoje",      targetValue: 1,   xpReward: 30  },
  // ── LONG_SESSION ───────────────────────────────────────────────────────
  { type: "LONG_SESSION",      difficulty: "medium", label: "Complete uma sessão de 25+ minutos",  targetValue: 1,   xpReward: 60  },
  { type: "LONG_SESSION",      difficulty: "hard",   label: "Complete uma sessão de 45+ minutos",  targetValue: 1,   xpReward: 90  },
  // ── MARK_TOPICS ────────────────────────────────────────────────────────
  { type: "MARK_TOPICS",       difficulty: "easy",   label: "Marque 2 tópicos como vistos",        targetValue: 2,   xpReward: 40  },
  { type: "MARK_TOPICS",       difficulty: "medium", label: "Marque 4 tópicos como vistos",        targetValue: 4,   xpReward: 65  },
  // ── STUDY_PRIORITY ─────────────────────────────────────────────────────
  { type: "STUDY_PRIORITY",    difficulty: "medium", label: "Estude 2 tópicos distintos hoje",     targetValue: 2,   xpReward: 60  },
  { type: "STUDY_PRIORITY",    difficulty: "hard",   label: "Estude 4 tópicos distintos hoje",     targetValue: 4,   xpReward: 100 },
];

const MISSIONS_PER_DAY = 3;
const ALL_MISSIONS_BONUS_XP = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Unbiased Fisher-Yates shuffle sample */
function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const take = Math.min(count, copy.length);
  for (let i = copy.length - 1; i > copy.length - 1 - take; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(copy.length - take);
}

/**
 * Maps streak/level to a difficulty tier.
 * New users get easy missions; experienced users get a harder mix.
 */
function chooseDifficulty(streakDays: number, level: number): Difficulty {
  const score = streakDays + level * 2;
  if (score >= 20) return "hard";
  if (score >= 7)  return "medium";
  return "easy";
}

/**
 * Selects up to `count` unique-type missions filtered by difficulty tier.
 * Falls back to lower tiers when the target tier doesn't have enough variety.
 */
function selectMissions(
  count: number,
  usedTypes: Set<string>,
  streakDays: number,
  level: number,
): MissionTemplate[] {
  const tier = chooseDifficulty(streakDays, level);
  let tierOrder: Difficulty[];
  if (tier === "hard")        tierOrder = ["hard", "medium", "easy"];
  else if (tier === "medium") tierOrder = ["medium", "easy", "hard"];
  else                        tierOrder = ["easy", "medium", "hard"];

  const selected: MissionTemplate[] = [];
  const usedTypesLocal = new Set(usedTypes);

  for (const t of tierOrder) {
    if (selected.length >= count) break;
    const pool = MISSION_POOL.filter(
      (m) => m.difficulty === t && !usedTypesLocal.has(m.type),
    );
    const picks = pickRandom(pool, count - selected.length);
    for (const p of picks) {
      usedTypesLocal.add(p.type);
      selected.push(p);
    }
  }

  return selected;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Gets today's missions for the user, creating them if they don't exist yet.
 * Adapts difficulty based on streak and level.
 */
export async function getOrCreateTodayMissions(
  userId: string,
  opts: { streakDays?: number; level?: number } = {},
): Promise<DailyMissionSummary[]> {
  const date = todayString();

  const existing = await prisma.dailyMission.findMany({
    where: { userId, date, NOT: { type: BONUS_SENTINEL_TYPE } },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length >= MISSIONS_PER_DAY) {
    return existing.map(toSummary);
  }

  // Need user data for difficulty if not provided
  let streakDays = opts.streakDays ?? 0;
  let level = opts.level ?? 1;
  if (opts.streakDays === undefined || opts.level === undefined) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true, level: true },
    });
    streakDays = user?.streakDays ?? 0;
    level = user?.level ?? 1;
  }

  const usedTypes = new Set(existing.map((m) => m.type));
  const needed = MISSIONS_PER_DAY - existing.length;
  const picked = selectMissions(needed, usedTypes, streakDays, level);

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
    where: { userId, date, NOT: { type: BONUS_SENTINEL_TYPE } },
    orderBy: { createdAt: "asc" },
  });
  return all.map(toSummary);
}

/**
 * Recalculates mission progress for today based on actual activity.
 * - Real sessions: minutes > 1  (timer sessions)
 * - Mark sessions: minutes === 1 (markTopicAsStudied)
 * Runs all DB updates in a single transaction.
 */
export async function refreshMissionProgress(userId: string): Promise<void> {
  const date = todayString();
  const dayStart = startOfDay(new Date());
  const dayEnd = endOfDay(new Date());

  const missions = await prisma.dailyMission.findMany({
    where: { userId, date, completed: false, NOT: { type: BONUS_SENTINEL_TYPE } },
  });

  if (missions.length === 0) return;

  // Gather today's data in parallel
  const [allSessions, plannedTopicIds] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, completedAt: { gte: dayStart, lte: dayEnd } },
      select: { minutes: true, topicId: true },
    }),
    // Topics with a PlannedSession scheduled for today — used by USE_PLANNED
    prisma.plannedSession.findMany({
      where: { userId, scheduledDate: { gte: dayStart, lte: dayEnd } },
      select: { topicId: true },
    }).then((rows) => new Set(rows.map((r) => r.topicId))),
  ]);

  // Real study sessions (timer) — exclude 1-minute "mark" sessions
  const realSessions = allSessions.filter((s) => s.minutes > 1);
  // Mark-as-studied sessions — exactly 1 minute
  const markSessions = allSessions.filter((s) => s.minutes === 1);

  const totalMinutes = realSessions.reduce((s, r) => s + r.minutes, 0);
  const sessionCount = realSessions.length;
  const distinctTopics = new Set(realSessions.map((s) => s.topicId)).size;
  const has25MinSession = realSessions.some((s) => s.minutes >= 25) ? 1 : 0;
  const has45MinSession = realSessions.some((s) => s.minutes >= 45) ? 1 : 0;
  const markedTopics = markSessions.length;
  const studiedToday = realSessions.length > 0 ? 1 : 0;

  // USE_PLANNED: count how many planned topics were actually studied today
  const plannedTopicsStudied = realSessions.filter((s) =>
    plannedTopicIds.has(s.topicId),
  ).length;

  const progressMap: Record<string, number> = {
    STUDY_MINUTES:     totalMinutes,
    COMPLETE_SESSIONS: sessionCount,
    STUDY_TOPICS:      distinctTopics,
    USE_PLANNED:       plannedTopicsStudied,
    STREAK_MAINTAIN:   studiedToday,
    // LONG_SESSION: different targets per template — handled per-mission below
    MARK_TOPICS:       markedTopics,
    STUDY_PRIORITY:    distinctTopics,
  };

  const now = new Date();
  const updates = missions.map((mission) => {
    let progress: number;
    // LONG_SESSION has variant targets (25 min vs 45 min)
    if (mission.type === "LONG_SESSION") {
      progress = mission.targetValue >= 45 ? has45MinSession : has25MinSession;
    } else {
      progress = progressMap[mission.type] ?? 0;
    }

    const clamped = Math.min(progress, mission.targetValue);
    const completed = clamped >= mission.targetValue;

    return prisma.dailyMission.update({
      where: { id: mission.id },
      data: {
        progress: clamped,
        ...(completed ? { completed: true, completedAt: now } : {}),
      },
    });
  });

  await prisma.$transaction(updates);
}

/**
 * Checks if all 3 missions are done today and awards the bonus XP exactly once.
 * Uses a sentinel row in `daily_missions` (type = "_BONUS_AWARDED") to prevent
 * double-awarding across multiple calls in the same day.
 *
 * Returns the bonus XP if newly awarded, 0 if already awarded or not all done.
 */
export async function checkAllMissionsCompleted(
  userId: string,
): Promise<number> {
  const date = todayString();

  const [missions, alreadyAwarded] = await Promise.all([
    prisma.dailyMission.findMany({
      where: { userId, date, NOT: { type: BONUS_SENTINEL_TYPE } },
      select: { completed: true },
    }),
    prisma.dailyMission.findFirst({
      where: { userId, date, type: BONUS_SENTINEL_TYPE },
    }),
  ]);

  if (alreadyAwarded) return 0;
  if (missions.length < MISSIONS_PER_DAY) return 0;
  if (!missions.every((m) => m.completed)) return 0;

  // Create sentinel to prevent future double-awards (unique constraint prevents race)
  try {
    await prisma.dailyMission.create({
      data: {
        userId,
        date,
        type: BONUS_SENTINEL_TYPE,
        label: "_bonus",
        targetValue: 1,
        progress: 1,
        completed: true,
        xpReward: ALL_MISSIONS_BONUS_XP,
        completedAt: new Date(),
      },
    });
  } catch {
    // Another request already inserted it — race condition handled gracefully
    return 0;
  }

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
