import type { ChartDataPoint } from '@/types/analytics';

// Shared chart color palette
export const CHART_COLORS = {
  primary: '#3B82F6', // Blue
  success: '#10B981', // Green
  warning: '#F59E0B', // Yellow
  danger: '#EF4444', // Red
  purple: '#8B5CF6', // Purple
  cyan: '#06B6D4', // Cyan
  orange: '#F97316', // Orange
  pink: '#EC4899', // Pink
} as const;

// Chart color array for cycling through colors
export const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);

// Get chart color by index (cycles through colors)
export function getChartColor(index: number): string {
  return CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];
}

// Common chart margins
export const CHART_MARGINS = {
  small: { top: 5, right: 5, left: 5, bottom: 5 },
  medium: { top: 20, right: 30, left: 20, bottom: 5 },
  large: { top: 20, right: 30, left: 20, bottom: 25 },
} as const;

// Common chart dimensions
export const CHART_DIMENSIONS = {
  small: { height: 200 },
  medium: { height: 300 },
  large: { height: 400 },
  default: { height: 256 }, // 64 * 4 (h-64)
} as const;

// Common chart styles
export const CHART_STYLES = {
  grid: {
    strokeDasharray: '3 3',
    opacity: 0.3,
  },
  axis: {
    fontSize: 12,
  },
  bar: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
} as const;

// Chart configuration presets
export const CHART_PRESETS = {
  streakChart: {
    margins: CHART_MARGINS.medium,
    height: CHART_DIMENSIONS.default.height,
    colors: {
      current: CHART_COLORS.success,
      longest: CHART_COLORS.primary,
    },
  },
  completionRateChart: {
    margins: CHART_MARGINS.large,
    height: CHART_DIMENSIONS.default.height,
    colors: {
      excellent: CHART_COLORS.success, // 80-100%
      good: CHART_COLORS.primary, // 60-79%
      fair: CHART_COLORS.warning, // 40-59%
      poor: CHART_COLORS.danger, // 0-39%
    },
  },
} as const;

// Utility function to get completion rate color
export function getCompletionRateColor(rate: number): string {
  if (rate >= 80) return CHART_COLORS.success;
  if (rate >= 60) return CHART_COLORS.primary;
  if (rate >= 40) return CHART_COLORS.warning;
  return CHART_COLORS.danger;
}

// Common tooltip styles
export const TOOLTIP_STYLES = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
} as const;

// Format number for display
export function formatChartValue(value: number, type: 'percentage' | 'number' = 'number'): string {
  if (type === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  return value.toString();
}

// Format date for chart labels
export function formatChartDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
} 