import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { getToday, getTomorrow } from '@/utils/date';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent' | 'status'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskTime: (id: string, seconds: number) => void;
  moveTaskToTomorrow: (id: string) => void;
  getTasksByDate: (date: string) => Task[];
  getTasksByGoal: (goalId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksCountByDate: (date: string) => number;
  getCompletedTasksCountByDate: (date: string) => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => {
        const now = new Date().toISOString();
        const id = Date.now().toString();
        
        const newTask: Task = {
          id,
          ...taskData,
          status: 'pending',
          timeSpent: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        return id;
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      updateTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      updateTaskTime: (id, seconds) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, timeSpent: seconds, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      moveTaskToTomorrow: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { 
                  ...task, 
                  date: getTomorrow(), 
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
        }));
      },
      
      getTasksByDate: (date) => {
        return get().tasks.filter((task) => task.date === date);
      },
      
      getTasksByGoal: (goalId) => {
        return get().tasks.filter((task) => task.goalId === goalId);
      },
      
      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },
      
      getTasksCountByDate: (date) => {
        return get().tasks.filter((task) => task.date === date).length;
      },
      
      getCompletedTasksCountByDate: (date) => {
        return get().tasks.filter(
          (task) => task.date === date && task.status === 'completed'
        ).length;
      },
    }),
    {
      name: 'dofive-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);