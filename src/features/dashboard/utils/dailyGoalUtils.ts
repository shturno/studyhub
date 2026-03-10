export type DailyGoalState = "no-goal" | "in-progress" | "complete";

export interface DailyGoalInfo {
  state: DailyGoalState;
  pct: number;
  remaining: number;
  barColor: string;
}

/**
 * Format a minutes number into a human-readable string.
 * e.g. 90 -> "1h30min", 60 -> "1h", 45 -> "45min"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

/**
 * Compute the visual state of the daily goal card.
 */
export function computeDailyGoalInfo(
  targetMinutes: number,
  studiedTodayMinutes: number,
): DailyGoalInfo {
  if (targetMinutes <= 0) {
    return { state: "no-goal", pct: 0, remaining: 0, barColor: "#555" };
  }

  const isComplete = studiedTodayMinutes >= targetMinutes;

  if (isComplete) {
    return { state: "complete", pct: 100, remaining: 0, barColor: "#ffbe0b" };
  }

  const pct = Math.min(100, Math.round((studiedTodayMinutes / targetMinutes) * 100));
  const remaining = Math.max(0, targetMinutes - studiedTodayMinutes);
  const barColor = pct >= 75 ? "#00ff41" : pct >= 40 ? "#00c8ff" : "#7f7f9f";

  return { state: "in-progress", pct, remaining, barColor };
}
