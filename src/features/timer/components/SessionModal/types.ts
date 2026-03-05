export interface TrackOption {
  readonly id: string;
  readonly name: string;
}

export interface LessonOption {
  readonly id: string;
  readonly title: string;
  readonly track: {
    readonly name: string;
  };
}
