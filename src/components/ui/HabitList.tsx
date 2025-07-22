'use client';

import { useEffect, useState } from 'react';
import { fetchHabits, deleteHabit } from '@/lib/habits';
import type { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trash2, Target, Eye } from 'lucide-react';

type HabitListProps = {
  userId: string;
  refreshKey?: any;
  onSelect?: (habitId: string) => void;
  selectedHabitId?: string | null;
  hideHeading?: boolean;
  onEdit?: (habit: Habit) => void;
};

const goalTypeConfig = {
  daily: { label: 'Daily', icon: '📅' },
  weekly: { label: 'Weekly', icon: '📊' },
  monthly: { label: 'Monthly', icon: '📈' },
};

export default function HabitList({
  userId,
  refreshKey,
  onSelect,
  selectedHabitId,
  hideHeading = false,
  onEdit,
}: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHabits = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHabits(userId);
        setHabits(data);
        setError(null);
      } catch (error) {
        setError('Failed to load habits. Please try again later.');
        console.error('Error fetching habits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHabits();
  }, [userId, refreshKey]);

  const handleDelete = async (habitId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await deleteHabit(habitId);
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      setError(null);
    } catch (error) {
      setError('Failed to delete habit. Please try again later.');
      console.error('Error deleting habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeHabits = habits.filter((habit) => habit.is_active);

  return (
    <div>
      {/* Header */}
      {!hideHeading && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-800">Habits</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              {activeHabits.length}{' '}
              {activeHabits.length === 1 ? 'habit' : 'habits'}
            </Badge>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading habits...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activeHabits.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            No habits found
          </h3>
          <p className="text-slate-500">
            Create your first habit to get started!
          </p>
        </div>
      )}

      {/* Habits Grid */}
      {!isLoading && activeHabits.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeHabits.map((habit) => (
            <Card
              key={habit.id}
              className={`hover:shadow-lg transition-all duration-200 border-slate-200 bg-white cursor-pointer ${
                selectedHabitId === habit.id
                  ? 'ring-2 ring-green-500 border-green-200'
                  : ''
              }`}
              onClick={() => onSelect && onSelect(habit.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1">
                    {habit.name}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(habit);
                      }}
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 h-auto"
                      disabled={isLoading}
                      aria-label="Edit Habit"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.474 5.474a2.121 2.121 0 1 1 3 3L7.5 20.448l-4 1 1-4 12.974-12.974Z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(habit.id);
                      }}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                      disabled={isLoading}
                      aria-label="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
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
                    {habit.goal_target}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {habit.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {habit.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span>Click to view details</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelect) onSelect(habit.id);
                    }}
                    className="text-xs h-7 px-2"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
