import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { getToday, getTomorrow } from '@/utils/date';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent' | 'status' | 'tags'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTimeToTask: (id: string, seconds: number) => void;
  moveTaskToDate: (id: string, date: string) => void;
  duplicateTask: (id: string, newDate?: string) => string;
  getTasksByDate: (date: string) => Task[];
  getTasksByGoal: (goalId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksCountByDate: (date: string) => number;
  getCompletedTasksCountByDate: (date: string) => number;
  getTotalTimeSpentByDate: (date: string) => number;
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getOverdueTasks: () => Task[];
  searchTasks: (query: string) => Task[];
  getTasksByTag: (tag: string) => Task[];
  addTagToTask: (id: string, tag: string) => void;
  removeTagFromTask: (id: string, tag: string) => void;
  getAllTags: () => string[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => {
        const now = new Date().toISOString();
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTask: Task = {
          id,
          ...taskData,
          status: 'pending',
          timeSpent: 0,
          tags: [],
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
      
      addTimeToTask: (id, seconds) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { 
                  ...task, 
                  timeSpent: task.timeSpent + seconds, 
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
        }));
      },
      
      moveTaskToDate: (id, date) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, date, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      duplicateTask: (id, newDate) => {
        const task = get().getTaskById(id);
        if (!task) return '';
        
        const now = new Date().toISOString();
        const newId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const duplicatedTask: Task = {
          ...task,
          id: newId,
          date: newDate || task.date,
          status: 'pending',
          timeSpent: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: [...state.tasks, duplicatedTask],
        }));
        
        return newId;
      },
      
      getTasksByDate: (date) => {
        return get().tasks
          .filter((task) => task.date === date)
          .sort((a, b) => {
            // Sort by priority first, then by creation time
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
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
      
      getTotalTimeSpentByDate: (date) => {
        return get().tasks
          .filter((task) => task.date === date)
          .reduce((total, task) => total + task.timeSpent, 0);
      },
      
      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },
      
      getOverdueTasks: () => {
        const today = getToday();
        return get().tasks.filter(
          (task) => task.date < today && task.status !== 'completed'
        );
      },
      
      searchTasks: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description?.toLowerCase().includes(lowercaseQuery) ||
            task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },
      
      getTasksByTag: (tag) => {
        return get().tasks.filter((task) => task.tags.includes(tag));
      },
      
      addTagToTask: (id, tag) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id && !task.tags.includes(tag)
              ? { 
                  ...task, 
                  tags: [...task.tags, tag], 
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
        }));
      },
      
      removeTagFromTask: (id, tag) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { 
                  ...task, 
                  tags: task.tags.filter(t => t !== tag), 
                  updatedAt: new Date().toISOString() 
                }
              : task
          ),
        }));
      },
      
      getAllTags: () => {
        const allTags = get().tasks.flatMap(task => task.tags);
        return [...new Set(allTags)].sort();
      },
    }),
    {
      name: 'dofive-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);