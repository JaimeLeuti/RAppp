import { create } from 'zustand';
import { TimerSession } from '@/types';

interface TimerState {
  isRunning: boolean;
  taskId: string | null;
  startTime: number | null;
  elapsedTime: number;
  sessions: TimerSession[];
  currentSessionId: string | null;
  
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  updateElapsedTime: () => void;
  
  addSession: (session: Omit<TimerSession, 'id'>) => string;
  completeSession: (sessionId: string) => void;
  getSessionsByTask: (taskId: string) => TimerSession[];
  getTotalTimeByTask: (taskId: string) => number;
  getSessionById: (sessionId: string) => TimerSession | undefined;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  taskId: null,
  startTime: null,
  elapsedTime: 0,
  sessions: [],
  currentSessionId: null,
  
  startTimer: (taskId) => {
    const now = Date.now();
    const sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    set({
      isRunning: true,
      taskId,
      startTime: now,
      elapsedTime: 0,
      currentSessionId: sessionId,
    });
    
    // Create a new session
    get().addSession({
      taskId,
      startTime: new Date(now).toISOString(),
      duration: 0,
      type: 'focus',
      completed: false,
    });
  },
  
  stopTimer: () => {
    const { currentSessionId, elapsedTime } = get();
    
    if (currentSessionId) {
      get().completeSession(currentSessionId);
    }
    
    set({
      isRunning: false,
      startTime: null,
      currentSessionId: null,
    });
  },
  
  pauseTimer: () => {
    get().updateElapsedTime();
    set({
      isRunning: false,
      startTime: null,
    });
  },
  
  resumeTimer: () => {
    set({
      isRunning: true,
      startTime: Date.now(),
    });
  },
  
  resetTimer: () => {
    set({
      isRunning: false,
      taskId: null,
      startTime: null,
      elapsedTime: 0,
      currentSessionId: null,
    });
  },
  
  updateElapsedTime: () => {
    const { startTime, elapsedTime } = get();
    if (startTime) {
      const now = Date.now();
      const additionalTime = Math.floor((now - startTime) / 1000);
      set({
        elapsedTime: elapsedTime + additionalTime,
        startTime: now,
      });
    }
  },
  
  addSession: (sessionData) => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: TimerSession = {
      id,
      ...sessionData,
    };
    
    set((state) => ({
      sessions: [...state.sessions, session],
    }));
    
    return id;
  },
  
  completeSession: (sessionId) => {
    const { elapsedTime } = get();
    
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              endTime: new Date().toISOString(),
              duration: elapsedTime,
              completed: true,
            }
          : session
      ),
    }));
  },
  
  getSessionsByTask: (taskId) => {
    return get().sessions.filter((session) => session.taskId === taskId);
  },
  
  getTotalTimeByTask: (taskId) => {
    return get().sessions
      .filter((session) => session.taskId === taskId && session.completed)
      .reduce((total, session) => total + session.duration, 0);
  },
  
  getSessionById: (sessionId) => {
    return get().sessions.find((session) => session.id === sessionId);
  },
}));