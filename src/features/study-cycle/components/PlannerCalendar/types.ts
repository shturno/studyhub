import type { PlannedSession } from "@/features/study-cycle/types";

export type { PlannedSession };

export interface PlannerCalendarProps {
  readonly sessions: PlannedSession[];
}
