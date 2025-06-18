import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyProgress } from '@/types';

interface HistoryState {
  dailyProgress: DailyProgress[];
  updateDailyProgress: (date: string, tasksCompleted: number, timeSpent: number) => void;
  getDailyProgress: (date: string) => DailyProgress | undefined;
  getDailyProgressForRange: (startDate: string, endDate: string) => DailyProgress[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      dailyProgress: [],
      
      updateDailyProgress: (date, tasksCompleted, timeSpent) => {
        const existingProgress = get().getDailyProgress(date);
        
        if (existingProgress) {
          set((state) => ({
            dailyProgress: state.dailyProgress.map((progress) =>
              progress.date === date
                ? { ...progress, tasksCompleted, timeSpent }
                : progress
            ),
          }));
        } else {
          set((state) => ({
            dailyProgress: [
              ...state.dailyProgress,
              { date, tasksCompleted, timeSpent },
            ],
          }));
        }
      },
      
      getDailyProgress: (date) => {
        return get().dailyProgress.find((progress) => progress.date === date);
      },
      
      getDailyProgressForRange: (startDate, endDate) => {
        return get().dailyProgress.filter(
          (progress) => progress.date >= startDate && progress.date <= endDate
        );
      },
    }),
    {
      name: 'dofive-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);