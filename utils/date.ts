import { DailyProgress } from '@/types';

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date in YYYY-MM-DD format
export const getToday = (): string => {
  return formatDate(new Date());
};

// Get tomorrow's date in YYYY-MM-DD format
export const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

// Format seconds to HH:MM:SS
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

// Format seconds to human-readable format (e.g., 1h 30m)
export const formatTimeHuman = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Get date range for the current week
export const getCurrentWeekDates = (weekStartsOn: 0 | 1 | 6 = 0): string[] => {
  const today = new Date();
  const day = today.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - diff);
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatDate(date));
  }
  
  return dates;
};

// Get month name from date
export const getMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long' });
};

// Calculate intensity for heatmap (0-4)
export const calculateIntensity = (
  progress: DailyProgress | undefined,
  maxTasks: number = 5,
  maxTime: number = 28800 // 8 hours in seconds
): number => {
  if (!progress) return 0;
  
  const taskRatio = progress.tasksCompleted / maxTasks;
  const timeRatio = progress.timeSpent / maxTime;
  
  // Average of task completion and time spent ratios
  const intensity = (taskRatio + timeRatio) / 2;
  
  // Map to 0-4 scale
  if (intensity === 0) return 0;
  if (intensity < 0.25) return 1;
  if (intensity < 0.5) return 2;
  if (intensity < 0.75) return 3;
  return 4;
};