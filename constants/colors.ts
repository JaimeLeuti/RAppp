export const colors = {
  // Brand colors
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',
  
  // Neutral palette
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Status colors
  success: '#10B981',
  successLight: '#6EE7B7',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  info: '#3B82F6',
  infoLight: '#93C5FD',
  
  // Priority colors
  priority: {
    1: '#EF4444', // Critical - Red
    2: '#F59E0B', // High - Orange
    3: '#6366F1', // Medium - Indigo
    4: '#10B981', // Low - Green
    5: '#6B7280', // Minimal - Gray
  },
  
  // Goal colors
  goalColors: [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#84CC16', // Lime
  ],
  
  // Gradients
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#EF4444', '#DC2626'],
  },
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default colors;