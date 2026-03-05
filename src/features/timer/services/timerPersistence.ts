import { get, set, del } from "idb-keyval";

const TIMER_KEY = "studyhub:pendingTimer";

export interface PersistedTimerState {
  topicId: string;
  totalSeconds: number;
  elapsedSeconds: number;
  startedAt: number;
  isRunning: boolean;
}

export const timerPersistence = {
  async save(state: PersistedTimerState): Promise<void> {
    await set(TIMER_KEY, state);
  },
  async load(): Promise<PersistedTimerState | undefined> {
    return get<PersistedTimerState>(TIMER_KEY);
  },
  async clear(): Promise<void> {
    await del(TIMER_KEY);
  },
};
