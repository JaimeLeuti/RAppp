import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GoalType, GoalTimeframe, Milestone } from '@/types';
import { colors } from '@/constants/colors';

interface GoalState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'current' | 'milestones'>) => string;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addMilestone: (goalId: string, title: string) => string;
  updateMilestone: (goalId: string, milestoneId: string, completed: boolean) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  getGoalById: (id: string) => Goal | undefined;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      
      addGoal: (goalData) => {
        const now = new Date().toISOString();
        const id = Date.now().toString();
        
        const newGoal: Goal = {
          id,
          ...goalData,
          current: 0,
          milestones: [],
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
      
      updateGoalProgress: (id, progress) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { 
                  ...goal, 
                  current: goal.current + progress,
                  updatedAt: new Date().toISOString() 
                }
              : goal
          ),
        }));
      },
      
      addMilestone: (goalId, title) => {
        const milestoneId = Date.now().toString();
        
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
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : goal
          ),
        }));
        
        return milestoneId;
      },
      
      updateMilestone: (goalId, milestoneId, completed) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.map((milestone) =>
                    milestone.id === milestoneId
                      ? { ...milestone, completed }
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
      
      getGoalById: (id) => {
        return get().goals.find((goal) => goal.id === id);
      },
      
      getActiveGoals: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().goals.filter(
          (goal) => 
            goal.endDate >= today && 
            goal.current < goal.target
        );
      },
      
      getCompletedGoals: () => {
        return get().goals.filter((goal) => goal.current >= goal.target);
      },
    }),
    {
      name: 'dofive-goals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);