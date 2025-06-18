export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // ISO date string (YYYY-MM-DD)
  goalId?: string; // Optional reference to a goal
  timeSpent: number; // Time spent in seconds
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type GoalType = 'effort' | 'quantity' | 'hybrid';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  timeframe: GoalTimeframe;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  target: number; // Target value (time in seconds or quantity)
  current: number; // Current progress
  unit?: string; // Unit for quantity goals (e.g., "pages", "workouts")
  milestones: Milestone[];
  color: string; // Hex color code
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  date: string; // ISO date string (YYYY-MM-DD)
  tasksCompleted: number;
  timeSpent: number; // Time spent in seconds
}

export interface Settings {
  theme: 'light' | 'dark';
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM format
  weekStartsOn: 0 | 1 | 6; // 0: Sunday, 1: Monday, 6: Saturday
  showCompletedTasks: boolean;
}