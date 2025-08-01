// Analytics Types for Phase 6: Analytics & Streaks

export interface StreakData {
  habit_id: string;
  habit_name: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completion_date: string | null;
  streak_start_date: string | null;
}

export interface CompletionRateData {
  habit_id: string;
  habit_name: string;
  completion_rate: number; // 0-100 percentage
  total_days: number;
  completed_days: number;
  period: 'week' | 'month' | 'year';
  period_start: string;
  period_end: string;
}

export interface HabitTrendData {
  date: string;
  habit_id: string;
  habit_name: string;
  completed: boolean;
  streak_count: number;
}

export interface AnalyticsSummary {
  total_habits: number;
  active_habits: number;
  average_completion_rate: number;
  total_current_streaks: number;
  longest_overall_streak: number;
  most_consistent_habit: {
    habit_id: string;
    habit_name: string;
    completion_rate: number;
  } | null;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface StreakChartData {
  habit_id: string;
  habit_name: string;
  data: ChartDataPoint[];
  current_streak: number;
  color: string;
}

export interface CompletionRateChartData {
  habit_id: string;
  habit_name: string;
  completion_rate: number;
  color: string;
  period: 'week' | 'month' | 'year';
}

// Export data types
export interface ExportData {
  habits: Array<{
    id: string;
    name: string;
    description: string;
    goal_type: 'daily' | 'weekly' | 'monthly';
    goal_target: number;
    created_at: string;
  }>;
  habit_events: Array<{
    habit_id: string;
    habit_name: string;
    event_date: string;
    note: string;
  }>;
  analytics: {
    export_date: string;
    period_start: string;
    period_end: string;
    summary: AnalyticsSummary;
  };
}
