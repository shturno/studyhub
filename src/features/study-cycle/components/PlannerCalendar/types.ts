import type { PlannedSession, ContestSummary } from "@/features/study-cycle/types";

export type { PlannedSession };

export interface PlannerCalendarProps {
  readonly sessions: PlannedSession[];
  readonly contests?: ContestSummary[];
}
