'use client';

import { useEffect, useState } from 'react';
import {
  fetchHabitDetails,
  fetchHabitEvents,
  toggleHabitEvent,
} from '@/lib/habits';
import type { Habit, HabitEvent } from '@/types/habit';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isBefore,
  isAfter,
  eachDayOfInterval,
  eachWeekOfInterval,
  getWeek,
  getWeeksInMonth,
  parseISO,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from 'date-fns';

const goalTypeConfig = {
  daily: { label: 'Daily', icon: '📅' },
  weekly: { label: 'Weekly', icon: '📊' },
  monthly: { label: 'Monthly', icon: '📈' },
};

type HabitTrackerProps = {
  habitId: string;
};

export default function HabitTracker({ habitId }: HabitTrackerProps) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [events, setEvents] = useState<HabitEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventLoading, setIsEventLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [habitData, eventData] = await Promise.all([
          fetchHabitDetails(habitId),
          fetchHabitEvents(habitId),
        ]);
        setHabit(habitData);
        setEvents(eventData);
      } catch (e) {
        setHabit(null);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (habitId) load();
  }, [habitId]);

  // Helper: get all event dates as string (YYYY-MM-DD)
  const eventDates = new Set(events.map((e) => e.event_date.slice(0, 10)));

  // Mark a day/week/month as complete
  const handleMarkComplete = async (dateStr: string) => {
    setIsEventLoading(true);
    try {
      await toggleHabitEvent(habitId, dateStr, 'Completed');
      setEvents((prev) => {
        if (prev.some((e) => e.event_date.slice(0, 10) === dateStr)) {
          return prev.map((e) =>
            e.event_date.slice(0, 10) === dateStr
              ? { ...e, note: 'Completed' }
              : e,
          );
        } else {
          return [
            ...prev,
            {
              id: Math.random().toString(),
              habit_id: habitId,
              user_id: '',
              event_date: dateStr,
              note: 'Completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            },
          ];
        }
      });
    } finally {
      setIsEventLoading(false);
    }
  };

  // Calendar grid logic
  const today = new Date();
  let calendarCells: {
    label: string;
    date: Date;
    isPast: boolean;
    isToday: boolean;
    isCompleted: boolean;
  }[] = [];
  let periodLabel = '';
  let progress = 0;
  let total = 0;
  let completed = 0;

  if (habit) {
    if (habit.goal_type === 'daily') {
      // Show current week (Sun-Sat)
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      calendarCells = days.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          label: format(date, 'EEE'),
          date,
          isPast: isBefore(date, today) || isSameDay(date, today),
          isToday: isSameDay(date, today),
          isCompleted: eventDates.has(dateStr),
        };
      });
      periodLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      total = days.length;
      completed = calendarCells.filter((c) => c.isCompleted).length;
      progress = Math.round((completed / total) * 100);
    } else if (habit.goal_type === 'weekly') {
      // Show current month, each week as a cell
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 0 },
      );
      calendarCells = weeks.map((weekStartDate) => {
        const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 0 });
        // Use week number as label
        const weekNum = getWeek(weekStartDate);
        // Mark complete if any event exists in that week
        const weekCompleted = events.some((e) => {
          const d = parseISO(e.event_date);
          return isSameWeek(d, weekStartDate, { weekStartsOn: 0 });
        });
        return {
          label: `Week ${weekNum}`,
          date: weekStartDate,
          isPast:
            isBefore(weekEndDate, today) ||
            isSameWeek(weekStartDate, today, { weekStartsOn: 0 }),
          isToday: isSameWeek(weekStartDate, today, { weekStartsOn: 0 }),
          isCompleted: weekCompleted,
        };
      });
      periodLabel = format(monthStart, 'MMMM yyyy');
      total = calendarCells.length;
      completed = calendarCells.filter((c) => c.isCompleted).length;
      progress = Math.round((completed / total) * 100);
    } else if (habit.goal_type === 'monthly') {
      // Show last 6 months including current
      const months = Array.from({ length: 6 }, (_, i) =>
        addMonths(startOfMonth(today), -5 + i),
      );
      calendarCells = months.map((monthDate) => {
        // Mark complete if any event exists in that month
        const monthCompleted = events.some((e) => {
          const d = parseISO(e.event_date);
          return isSameMonth(d, monthDate);
        });
        return {
          label: format(monthDate, 'MMM yyyy'),
          date: monthDate,
          isPast:
            isBefore(endOfMonth(monthDate), today) ||
            isSameMonth(monthDate, today),
          isToday: isSameMonth(monthDate, today),
          isCompleted: monthCompleted,
        };
      });
      periodLabel = `${format(months[0], 'MMM yyyy')} - ${format(months[months.length - 1], 'MMM yyyy')}`;
      total = calendarCells.length;
      completed = calendarCells.filter((c) => c.isCompleted).length;
      progress = Math.round((completed / total) * 100);
    }
  }

  // Modern UI
  return (
    <Card className="border-slate-200 bg-white shadow-xl">
      <CardHeader className="pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-slate-800">Habit Tracker</h3>
            {habit && (
              <Badge
                style={{
                  backgroundColor: habit.color,
                  color: '#fff',
                  border: 0,
                }}
              >
                {goalTypeConfig[habit.goal_type].icon}{' '}
                {goalTypeConfig[habit.goal_type].label}
              </Badge>
            )}
          </div>
          {habit && (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200"
            >
              Target: {habit.goal_target}
            </Badge>
          )}
        </div>
        {habit && (
          <div className="flex items-center gap-4 mt-2">
            <span className="text-slate-500 text-sm font-medium">
              {periodLabel}
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: habit.color,
                  minWidth: progress > 0 ? 8 : 0,
                }}
              />
            </div>
            <span className="text-slate-700 text-xs font-semibold">
              {progress}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <span className="text-slate-500">Loading tracker...</span>
          </div>
        ) : habit ? (
          <div className="w-full flex flex-col gap-6">
            <div
              className={`grid ${
                habit.goal_type === 'daily'
                  ? 'grid-cols-7'
                  : habit.goal_type === 'weekly'
                    ? 'grid-cols-4 md:grid-cols-6'
                    : 'grid-cols-2 md:grid-cols-3'
              } gap-3`}
            >
              {calendarCells.map((cell) => (
                <div
                  key={cell.label}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all shadow-sm
                    ${cell.isToday ? 'ring-2 ring-green-500 border-green-200 bg-green-50' : 'border-slate-200 bg-white'}
                    ${cell.isCompleted ? 'bg-green-100 border-green-200' : ''}
                    ${!cell.isPast ? 'opacity-60' : ''}
                  `}
                >
                  <span className="text-xs font-semibold text-slate-500 mb-1">
                    {cell.label}
                  </span>
                  <Button
                    size="icon"
                    variant={cell.isCompleted ? 'outline' : 'default'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center
                      ${cell.isCompleted ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : 'bg-green-600 hover:bg-green-700 text-white'}
                      ${isEventLoading ? 'opacity-60 pointer-events-none' : ''}
                    `}
                    disabled={
                      cell.isCompleted || !cell.isPast || isEventLoading
                    }
                    onClick={() =>
                      handleMarkComplete(format(cell.date, 'yyyy-MM-dd'))
                    }
                  >
                    {cell.isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </Button>
                  {cell.isToday && (
                    <span className="text-xs text-green-600 font-bold mt-1">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6 items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700 text-sm font-medium">
                  {completed} / {total}{' '}
                  {habit.goal_type === 'daily'
                    ? 'days'
                    : habit.goal_type === 'weekly'
                      ? 'weeks'
                      : 'months'}{' '}
                  completed
                </span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Completed
                </Badge>
                <Badge className="bg-white text-slate-500 border-slate-200">
                  Pending
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-medium text-slate-600 mb-1">No habit found</h4>
            <p className="text-slate-500 text-sm">
              Please select a habit to track.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
