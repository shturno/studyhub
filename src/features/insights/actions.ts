"use server";

import { auth } from "@/lib/auth";
import { ok, err, type ActionResult } from "@/lib/result";
import { getTopicDurationSuggestion } from "./services/learningContextService";
import { getWeeklyTip } from "./services/weeklyTipService";
import type { WeeklyTip } from "./types";

/**
 * Returns a suggested session duration (minutes) for a given topic,
 * based on the user's real study history for that topic.
 */
export async function suggestTopicDuration(
  topicId: string,
): Promise<ActionResult<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");
    const minutes = await getTopicDurationSuggestion(session.user.id, topicId);
    return ok(minutes);
  } catch {
    return ok(25); // safe fallback
  }
}

/**
 * Returns the current weekly tip for the authenticated user,
 * or null if no tip is available yet (not enough history).
 */
export async function fetchWeeklyTip(): Promise<ActionResult<WeeklyTip | null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");
    const tip = await getWeeklyTip(session.user.id);
    return ok(tip);
  } catch {
    return ok(null);
  }
}
