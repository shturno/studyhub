import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityEventType =
  | "SESSION_COMPLETED"
  | "STREAK_BROKEN"
  | "XP_LOST"
  | "OBLIGATION_MISSED"
  | "LEVEL_UP"
  | "ACHIEVEMENT"
  | "QUESTIONS_LOGGED";

export interface ActivityEventMetadata {
  // SESSION_COMPLETED
  xp?: number;
  topicName?: string;
  minutes?: number;
  // STREAK_BROKEN / XP_LOST
  streakLost?: number;
  penalty?: number;
  // OBLIGATION_MISSED
  date?: string;
  obligationTopic?: string;
  // LEVEL_UP
  level?: number;
  // ACHIEVEMENT
  achievementName?: string;
  achievementIcon?: string;
  // QUESTIONS_LOGGED
  total?: number;
  correct?: number;
}

export interface ActivityEventSummary {
  id: string;
  type: ActivityEventType;
  metadata: ActivityEventMetadata;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Registers an activity event for the feed.
 * Fire-and-forget safe — errors are swallowed so they never block session saves.
 */
export async function recordActivityEvent(
  userId: string,
  type: ActivityEventType,
  metadata: ActivityEventMetadata,
): Promise<void> {
  await prisma.activityEvent.create({
    data: { userId, type, metadata: metadata as object },
  });
}

/**
 * Fetches the most recent activity events for the user's feed.
 */
export async function getActivityFeed(
  userId: string,
  limit = 20,
): Promise<ActivityEventSummary[]> {
  const events = await prisma.activityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return events.map((e) => ({
    id: e.id,
    type: e.type as ActivityEventType,
    metadata: e.metadata as ActivityEventMetadata,
    createdAt: e.createdAt,
  }));
}
