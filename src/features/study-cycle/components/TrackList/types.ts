export interface Track {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly lessons: Array<{
    readonly id: string;
    readonly title: string;
    readonly status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
    readonly estimated: number | null;
    readonly studyLogs: Array<{
      readonly minutes: number;
    }>;
  }>;
}

export interface TrackListProps {
  readonly tracks: Track[];
}
