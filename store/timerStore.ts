import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  taskId: string | null;
  startTime: number | null;
  elapsedTime: number;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  updateElapsedTime: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  taskId: null,
  startTime: null,
  elapsedTime: 0,
  
  startTimer: (taskId) => {
    set({
      isRunning: true,
      taskId,
      startTime: Date.now(),
    });
  },
  
  stopTimer: () => {
    get().updateElapsedTime();
    set({
      isRunning: false,
      startTime: null,
    });
  },
  
  resetTimer: () => {
    set({
      isRunning: false,
      taskId: null,
      startTime: null,
      elapsedTime: 0,
    });
  },
  
  updateElapsedTime: () => {
    const { startTime, elapsedTime } = get();
    if (startTime) {
      const now = Date.now();
      const additionalTime = Math.floor((now - startTime) / 1000);
      set({
        elapsedTime: elapsedTime + additionalTime,
      });
    }
  },
}));