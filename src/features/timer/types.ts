export interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  hasCompleted: boolean;
}

export interface PomodoroActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTimeLeft: (time: number) => void;
  setCompleted: (completed: boolean) => void;
}

export type PomodoroStore = PomodoroState & PomodoroActions;
