import type { PlannerData } from "@/features/study-cycle/types";

export type { PlannerData };

export interface PlannerContentProps {
  readonly data: PlannerData;
  readonly contestId?: string;
}
