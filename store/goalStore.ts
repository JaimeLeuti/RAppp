import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GoalType, GoalTimeframe, Milestone } from '@/types';
import { getToday } from '@/utils/date';

interface GoalState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'current' | 'milestones' | 'isArchived'>) => string;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  unarchiveGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  resetGoalProgress: (id: string) => void;
  addMilestone: (goalId: string, title: string, dueDate?: string) => string;
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  getGoalById: (id: string) => Goal | undefined;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getArchivedGoals: () => Goal[];
  getGoalsByTimeframe: (timeframe: GoalTimeframe) => Goal[];
  getGoalsByType: (type: GoalType) => Goal[];
  getOverdueGoals: () => Goal[];
  searchGoals: (query: string) => Goal[];
  getGoalProgress: (id: string) => number;
  getGoalCompletionPercentage: (id: string) => number;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      
      addGoal: (goalData) => {
        const now = new Date().toISOString();
        const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newGoal: Goal = {
          id,
          ...goalData,
          current: 0,
          milestones: [],
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
        
        return id;
      },
      
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },
      
      archiveGoal: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, isArchived: true, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },
      
      unarchiveGoal: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, isArchived: false, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },
      
      updateGoalProgress: (id, progress) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { 
                  ...goal, 
                  current: Math.max(0, goal.current + progress),
                  updatedAt: new Date().toISOString() 
                }
              : goal
          ),
        }));
      },
      
      resetGoalProgress: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, current: 0, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },
      
      addMilestone: (goalId, title, dueDate) => {
        const milestoneId = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: [
                    ...goal.milestones,
                    {
                      id: milestoneId,
                      title,
                      completed: false,
                      dueDate,
                      createdAt: now,
                    },
                  ],
                  updatedAt: now,
                }
              : goal
          ),
        }));
        
        return milestoneId;
      },
      
      updateMilestone: (goalId, milestoneId, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.map((milestone) =>
                    milestone.id === milestoneId
                      ? { ...milestone, ...updates }
                      : milestone
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : goal
          ),
        }));
      },
      
      deleteMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.filter(
                    (milestone) => milestone.id !== milestoneId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : goal
          ),
        }));
      },
      
      toggleMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.map((milestone) =>
                    milestone.id === milestoneId
                      ? { ...milestone, completed: !milestone.completed }
                      : milestone
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : goal
          ),
        }));
      },
      
      getGoalById: (id) => {
        return get().goals.find((goal) => goal.id === id);
      },
      
      getActiveGoals: () => {
        const today = getToday();
        return get().goals.filter(
          (goal) => 
            !goal.isArchived &&
            goal.endDate >= today && 
            goal.current < goal.target
        );
      },
      
      getCompletedGoals: () => {
        return get().goals.filter(
          (goal) => !goal.isArchived && goal.current >= goal.target
        );
      },
      
      getArchivedGoals: () => {
        return get().goals.filter((goal) => goal.isArchived);
      },
      
      getGoalsByTimeframe: (timeframe) => {
        return get().goals.filter(
          (goal) => !goal.isArchived && goal.timeframe === timeframe
        );
      },
      
      getGoalsByType: (type) => {
        return get().goals.filter(
          (goal) => !goal.isArchived && goal.type === type
        );
      },
      
      getOverdueGoals: () => {
        const today = getToday();
        return get().goals.filter(
          (goal) => 
            !goal.isArchived &&
            goal.endDate < today && 
            goal.current < goal.target
        );
      },
      
      searchGoals: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().goals.filter(
          (goal) =>
            !goal.isArchived &&
            (goal.title.toLowerCase().includes(lowercaseQuery) ||
            goal.description?.toLowerCase().includes(lowercaseQuery))
        );
      },
      
      getGoalProgress: (id) => {
        const goal = get().getGoalById(id);
        return goal ? goal.current : 0;
      },
      
      getGoalCompletionPercentage: (id) => {
        const goal = get().getGoalById(id);
        if (!goal || goal.target === 0) return 0;
        return Math.min((goal.current / goal.target) * 100, 100);
      },
    }),
    {
      name: 'dofive-goals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);