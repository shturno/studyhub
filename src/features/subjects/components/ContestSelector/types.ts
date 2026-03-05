import type { Contest } from "@prisma/client";

export interface ContestSelectorProps {
  readonly contests: Pick<Contest, "id" | "name" | "isPrimary">[];
  readonly activeContestId?: string;
}
