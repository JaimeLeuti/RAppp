export type TaskPriority = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type GoalType = 'effort' | 'quantity' | 'hybrid';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // ISO date string (YYYY-MM-DD)
  goalId?: string;
  timeSpent: number; // seconds
  estimatedTime?: number; // seconds
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  timeframe: GoalTimeframe;
  startDate: string;
  endDate: string;
  target: number;
  current: number;
  unit?: string;
  milestones: Milestone[];
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  date: string;
  tasksCompleted: number;
  timeSpent: number;
  focusScore: number; // 0-100
  streakCount: number;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  reminderEnabled: boolean;
  reminderTime: string;
  weekStartsOn: 0 | 1 | 6;
  showCompletedTasks: boolean;
  focusMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  maxDailyTasks: number;
}

export interface TimerSession {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  type: 'focus' | 'break';
  completed: boolean;
}