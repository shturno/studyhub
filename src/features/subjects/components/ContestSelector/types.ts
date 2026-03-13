import type { Contest } from "@prisma/client";

export interface ContestSelectorProps {
  readonly contests: Pick<Contest, "id" | "slug" | "name" | "isPrimary">[];
  readonly activeContestSlug?: string;
}
