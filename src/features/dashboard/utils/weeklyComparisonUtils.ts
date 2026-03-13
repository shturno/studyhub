import { startOfWeek, subWeeks, format } from "date-fns";

export interface WeeklyComparisonData {
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  deltaPercent: number;
  personalBestMinutes: number;
  last4Weeks: Array<{ weekLabel: string; minutes: number }>;
  isPersonalBest: boolean;
}

/**
 * Compute weekly comparison statistics from the raw weekly chart data.
 *
 * @param weeklyChartRaw - Array of { week_start: Date; minutes: number } from DB (last 8 weeks)
 * @param now - Reference date (default: new Date())
 */
export function computeWeeklyComparison(
  weeklyChartRaw: Array<{ week_start: Date; minutes: number }>,
  now: Date = new Date(),
): WeeklyComparisonData {
  // Build a map of isoKey (week start ISO string) → minutes
  const map = new Map<string, number>();
  for (const row of weeklyChartRaw) {
    const key = startOfWeek(new Date(row.week_start), { weekStartsOn: 1 }).toISOString();
    map.set(key, Number(row.minutes));
  }

  // Keys for this week and last week
  const thisWeekKey = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const lastWeekKey = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString();

  const thisWeekMinutes = map.get(thisWeekKey) ?? 0;
  const lastWeekMinutes = map.get(lastWeekKey) ?? 0;

  // Delta percent vs last week
  let deltaPercent = 0;
  if (lastWeekMinutes > 0) {
    deltaPercent = Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100);
  } else if (thisWeekMinutes > 0) {
    deltaPercent = 100; // first week with data
  }

  // Personal best = max across all available weeks
  const allMinutes = Array.from(map.values());
  const personalBestMinutes = allMinutes.length > 0 ? Math.max(...allMinutes) : 0;

  const isPersonalBest = thisWeekMinutes > 0 && thisWeekMinutes >= personalBestMinutes;

  // Last 4 weeks (oldest first) for mini-chart
  const last4Weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 3 - i), { weekStartsOn: 1 });
    const key = weekStart.toISOString();
    return {
      weekLabel: format(weekStart, "dd/MM"),
      minutes: map.get(key) ?? 0,
    };
  });

  return {
    thisWeekMinutes,
    lastWeekMinutes,
    deltaPercent,
    personalBestMinutes,
    last4Weeks,
    isPersonalBest,
  };
}

/**
 * Format a minutes value into a compact string: "4h 20min", "45min", "0min".
 */
export function formatWeekMinutes(minutes: number): string {
  if (minutes <= 0) return "0min";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
