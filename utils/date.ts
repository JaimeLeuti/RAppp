export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

export const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeHuman = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const getWeekDates = (weekStartsOn: 0 | 1 | 6 = 1): string[] => {
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

export const getMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long' });
};

export const getDayName = (date: Date): string => {
  return date.toLocaleString('default', { weekday: 'long' });
};

export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (formatDate(date) === formatDate(today)) return 'Today';
  if (formatDate(date) === formatDate(yesterday)) return 'Yesterday';
  if (formatDate(date) === formatDate(tomorrow)) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

export const calculateStreak = (progressData: { date: string; tasksCompleted: number }[]): number => {
  if (progressData.length === 0) return 0;
  
  const sortedData = progressData
    .filter(p => p.tasksCompleted > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedData.length === 0) return 0;
  
  let streak = 0;
  const today = getToday();
  let currentDate = today;
  
  for (const progress of sortedData) {
    if (progress.date === currentDate) {
      streak++;
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = formatDate(date);
    } else {
      break;
    }
  }
  
  return streak;
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  return date >= startDate && date <= endDate;
};

export const addDays = (date: string, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return formatDate(newDate);
};

export const getDaysUntil = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};