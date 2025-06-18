import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyProgress } from '@/types';
import { getToday, calculateStreak } from '@/utils/date';

interface HistoryState {
  dailyProgress: DailyProgress[];
  updateDailyProgress: (date: string, tasksCompleted: number, timeSpent: number, focusScore?: number) => void;
  getDailyProgress: (date: string) => DailyProgress | undefined;
  getDailyProgressForRange: (startDate: string, endDate: string) => DailyProgress[];
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getTotalTasksCompleted: () => number;
  getTotalTimeSpent: () => number;
  getAverageFocusScore: () => number;
  getProductiveDays: () => number;
  getWeeklyStats: (weekStartDate: string) => {
    totalTasks: number;
    totalTime: number;
    averageFocusScore: number;
    activeDays: number;
  };
  getMonthlyStats: (year: number, month: number) => {
    totalTasks: number;
    totalTime: number;
    averageFocusScore: number;
    activeDays: number;
  };
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      dailyProgress: [],
      
      updateDailyProgress: (date, tasksCompleted, timeSpent, focusScore = 0) => {
        const existingProgress = get().getDailyProgress(date);
        const currentStreak = get().getCurrentStreak();
        
        if (existingProgress) {
          set((state) => ({
            dailyProgress: state.dailyProgress.map((progress) =>
              progress.date === date
                ? { 
                    ...progress, 
                    tasksCompleted, 
                    timeSpent, 
                    focusScore,
                    streakCount: tasksCompleted > 0 ? currentStreak : 0
                  }
                : progress
            ),
          }));
        } else {
          const newProgress: DailyProgress = {
            date,
            tasksCompleted,
            timeSpent,
            focusScore,
            streakCount: tasksCompleted > 0 ? currentStreak + 1 : 0,
          };
          
          set((state) => ({
            dailyProgress: [...state.dailyProgress, newProgress],
          }));
        }
      },
      
      getDailyProgress: (date) => {
        return get().dailyProgress.find((progress) => progress.date === date);
      },
      
      getDailyProgressForRange: (startDate, endDate) => {
        return get().dailyProgress
          .filter((progress) => progress.date >= startDate && progress.date <= endDate)
          .sort((a, b) => a.date.localeCompare(b.date));
      },
      
      getCurrentStreak: () => {
        const progressData = get().dailyProgress.map(p => ({
          date: p.date,
          tasksCompleted: p.tasksCompleted
        }));
        return calculateStreak(progressData);
      },
      
      getLongestStreak: () => {
        const progressData = get().dailyProgress
          .filter(p => p.tasksCompleted > 0)
          .sort((a, b) => a.date.localeCompare(b.date));
        
        if (progressData.length === 0) return 0;
        
        let longestStreak = 1;
        let currentStreak = 1;
        
        for (let i = 1; i < progressData.length; i++) {
          const prevDate = new Date(progressData[i - 1].date);
          const currentDate = new Date(progressData[i].date);
          const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }
        
        return longestStreak;
      },
      
      getTotalTasksCompleted: () => {
        return get().dailyProgress.reduce((total, progress) => total + progress.tasksCompleted, 0);
      },
      
      getTotalTimeSpent: () => {
        return get().dailyProgress.reduce((total, progress) => total + progress.timeSpent, 0);
      },
      
      getAverageFocusScore: () => {
        const progressWithScore = get().dailyProgress.filter(p => p.focusScore > 0);
        if (progressWithScore.length === 0) return 0;
        
        const totalScore = progressWithScore.reduce((total, progress) => total + progress.focusScore, 0);
        return Math.round(totalScore / progressWithScore.length);
      },
      
      getProductiveDays: () => {
        return get().dailyProgress.filter(p => p.tasksCompleted > 0).length;
      },
      
      getWeeklyStats: (weekStartDate) => {
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        
        const weekData = get().getDailyProgressForRange(
          weekStartDate,
          weekEndDate.toISOString().split('T')[0]
        );
        
        const totalTasks = weekData.reduce((sum, day) => sum + day.tasksCompleted, 0);
        const totalTime = weekData.reduce((sum, day) => sum + day.timeSpent, 0);
        const activeDays = weekData.filter(day => day.tasksCompleted > 0).length;
        const daysWithScore = weekData.filter(day => day.focusScore > 0);
        const averageFocusScore = daysWithScore.length > 0
          ? Math.round(daysWithScore.reduce((sum, day) => sum + day.focusScore, 0) / daysWithScore.length)
          : 0;
        
        return {
          totalTasks,
          totalTime,
          averageFocusScore,
          activeDays,
        };
      },
      
      getMonthlyStats: (year, month) => {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const monthData = get().getDailyProgressForRange(startDate, endDate);
        
        const totalTasks = monthData.reduce((sum, day) => sum + day.tasksCompleted, 0);
        const totalTime = monthData.reduce((sum, day) => sum + day.timeSpent, 0);
        const activeDays = monthData.filter(day => day.tasksCompleted > 0).length;
        const daysWithScore = monthData.filter(day => day.focusScore > 0);
        const averageFocusScore = daysWithScore.length > 0
          ? Math.round(daysWithScore.reduce((sum, day) => sum + day.focusScore, 0) / daysWithScore.length)
          : 0;
        
        return {
          totalTasks,
          totalTime,
          averageFocusScore,
          activeDays,
        };
      },
    }),
    {
      name: 'dofive-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);