export interface MergeContestsViewProps {
  readonly availableContests: Array<{
    id: string;
    name: string;
    institution: string;
    _count: { subjects: number };
  }>;
}
