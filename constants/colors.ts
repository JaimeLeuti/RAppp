// Color palette for DoFive app
export const colors = {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    
    // Primary colors
    primary: '#6366F1', // Indigo
    primaryLight: '#A5B4FC',
    primaryDark: '#4F46E5',
    
    // Secondary colors
    secondary: '#F59E0B', // Amber
    secondaryLight: '#FCD34D',
    secondaryDark: '#D97706',
    
    // Neutral colors
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
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Task priority colors (gradient)
    priority: [
      '#6366F1', // Priority 1 (highest)
      '#8B5CF6',
      '#EC4899',
      '#F59E0B',
      '#10B981', // Priority 5
    ],
    
    // Muted color for tasks beyond 5
    muted: '#9CA3AF',
  };
  
  // Theme configuration
  export const theme = {
    light: {
      text: colors.gray900,
      textSecondary: colors.gray600,
      background: colors.white,
      card: colors.white,
      border: colors.gray200,
      notification: colors.primary,
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  };
  
  export default colors;