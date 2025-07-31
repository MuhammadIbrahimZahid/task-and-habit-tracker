'use client';

import { useState, useEffect } from 'react';
import { fetchHabitDetails } from '@/lib/habits';
import type { Habit } from '@/types/habit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Target, Calendar, Palette, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HabitDetailsProps = {
  habitId: string;
  onEdit?: (habit: Habit) => void;
};

const goalTypeConfig = {
  daily: { label: 'Daily', icon: '📅' },
  weekly: { label: 'Weekly', icon: '📊' },
  monthly: { label: 'Monthly', icon: '📈' },
};

export default function HabitDetails({ habitId, onEdit }: HabitDetailsProps) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadHabitDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHabitDetails(habitId);
        setHabit(data);
      } catch (error) {
        console.error('Error fetching habit details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHabitDetails();
  }, [habitId]);

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!habit) {
    return (
      <Card className="border-slate-200">
        <CardContent className="text-center py-8">
          <p className="text-slate-500">Habit not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {habit.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                className="text-white border-0"
                style={{ backgroundColor: habit.color }}
              >
                {goalTypeConfig[habit.goal_type].icon}{' '}
                {goalTypeConfig[habit.goal_type].label}
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                <Target className="w-3 h-3 mr-1" />
                Target: {habit.goal_target}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className="w-12 h-12 rounded-lg border-2 border-slate-200 shadow-sm"
              style={{ backgroundColor: habit.color }}
            />
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-green-700 border-green-200 hover:bg-green-50"
                onClick={() => onEdit(habit)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {habit.description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText className="w-4 h-4" />
              Description
            </div>
            <p className="text-slate-600 leading-relaxed pl-6">
              {habit.description}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Calendar className="w-4 h-4" />
              Goal Type
            </div>
            <p className="text-lg font-semibold text-slate-800 capitalize">
              {goalTypeConfig[habit.goal_type].icon} {habit.goal_type}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Target className="w-4 h-4" />
              Target
            </div>
            <p className="text-lg font-semibold text-slate-800">
              {habit.goal_target}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Palette className="w-4 h-4" />
              Color
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-slate-300"
                style={{ backgroundColor: habit.color }}
              />
              <span className="text-sm font-mono text-slate-600">
                {habit.color}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
