import type { DashboardData } from "@/features/dashboard/types";

export type { DashboardData };

export interface DashboardViewProps {
  readonly data: DashboardData;
  readonly contests?: {
    id: string;
    name: string;
    slug: string;
    [key: string]: unknown;
  }[];
  readonly activeContestId?: string;
}
