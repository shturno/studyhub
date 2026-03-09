import type { PlannerData, ContestSummary } from "@/features/study-cycle/types";

export type { PlannerData };

export interface PlannerContentProps {
  readonly data: PlannerData;
  /** @deprecated use data.contests instead */
  readonly contestId?: string;
  readonly contests?: ContestSummary[];
}
