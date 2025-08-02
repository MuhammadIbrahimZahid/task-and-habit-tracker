import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import type {
  StreakData,
  CompletionRateData,
  HabitTrendData,
  AnalyticsSummary,
  ChartDataPoint,
} from '@/types/analytics';

// Date utility functions
export function getDateRange(period: 'week' | 'month' | 'year') {
  const today = new Date();

  switch (period) {
    case 'week':
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case 'year':
      return {
        start: new Date(today.getFullYear(), 0, 1), // January 1st
        end: new Date(today.getFullYear(), 11, 31), // December 31st
      };
  }
}

export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateForDisplay(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

// Streak calculation helpers
export function calculateCurrentStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  for (const completedDate of sortedDates) {
    completedDate.setHours(0, 0, 0, 0);

    // Check if this date is consecutive
    const dayDiff = Math.floor(
      (currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff <= 1) {
      streak++;
      currentDate = completedDate;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

export function calculateLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime()); // Sort ascending

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currDate = sortedDates[i];

    const dayDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
}

// Completion rate calculations
export function calculateCompletionRate(
  completedDates: string[],
  period: 'week' | 'month' | 'year',
): { rate: number; totalDays: number; completedDays: number } {
  const { start, end } = getDateRange(period);
  const periodStart = start;
  const periodEnd = end;

  // Count total days in period
  const totalDays =
    Math.ceil(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  // Count completed days within period
  const completedDays = completedDates.filter((dateStr) => {
    const date = new Date(dateStr);
    return isWithinInterval(date, { start: periodStart, end: periodEnd });
  }).length;

  const rate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100, // Round to 2 decimal places
    totalDays,
    completedDays,
  };
}

// Chart data formatting
export function formatStreakDataForChart(
  habitId: string,
  habitName: string,
  completedDates: string[],
  color: string,
  days: number = 30,
): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = formatDateForAPI(date);
    const isCompleted = completedDates.includes(dateStr);

    chartData.push({
      date: formatDateForDisplay(date),
      value: isCompleted ? 1 : 0,
      label: dateStr,
    });
  }

  return chartData;
}

// Analytics summary calculations
export function calculateAnalyticsSummary(
  habits: Array<{
    id: string;
    name: string;
    color: string;
    is_active: boolean;
  }>,
  habitEvents: Array<{ habit_id: string; event_date: string }>,
): AnalyticsSummary {
  const activeHabits = habits.filter((h) => h.is_active);
  const totalHabits = habits.length;

  // Group events by habit
  const eventsByHabit = habitEvents.reduce(
    (acc, event) => {
      if (!acc[event.habit_id]) {
        acc[event.habit_id] = [];
      }
      acc[event.habit_id].push(event.event_date);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  // Calculate completion rates for each habit
  const habitCompletionRates = activeHabits.map((habit) => {
    const completedDates = eventsByHabit[habit.id] || [];
    const { rate } = calculateCompletionRate(completedDates, 'month');
    return {
      habit_id: habit.id,
      habit_name: habit.name,
      completion_rate: rate,
    };
  });

  // Calculate averages and find most consistent habit
  const averageCompletionRate =
    habitCompletionRates.length > 0
      ? habitCompletionRates.reduce(
          (sum, habit) => sum + habit.completion_rate,
          0,
        ) / habitCompletionRates.length
      : 0;

  const mostConsistentHabit =
    habitCompletionRates.length > 0
      ? habitCompletionRates.reduce((max, habit) =>
          habit.completion_rate > max.completion_rate ? habit : max,
        )
      : null;

  // Calculate total current streaks
  const totalCurrentStreaks = activeHabits.reduce((total, habit) => {
    const completedDates = eventsByHabit[habit.id] || [];
    const currentStreak = calculateCurrentStreak(completedDates);
    return total + currentStreak;
  }, 0);

  // Calculate longest overall streak
  const longestOverallStreak = Math.max(
    ...activeHabits.map((habit) => {
      const completedDates = eventsByHabit[habit.id] || [];
      return calculateLongestStreak(completedDates);
    }),
    0,
  );

  return {
    total_habits: totalHabits,
    active_habits: activeHabits.length,
    average_completion_rate: Math.round(averageCompletionRate * 100) / 100,
    total_current_streaks: totalCurrentStreaks,
    longest_overall_streak: longestOverallStreak,
    most_consistent_habit_id: mostConsistentHabit?.habit_id ?? null,
    most_consistent_habit_name: mostConsistentHabit?.habit_name ?? null,
    most_consistent_habit_rate: mostConsistentHabit?.completion_rate ?? null,
  };
}

// Color utilities for charts
export function getChartColor(index: number): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
  ];

  return colors[index % colors.length];
}
