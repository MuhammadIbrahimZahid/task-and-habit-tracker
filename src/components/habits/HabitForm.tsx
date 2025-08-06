'use client';

import type React from 'react';
import { useEffect } from 'react';

import { useState } from 'react';
import { createHabit, updateHabit } from '@/lib/habits';
import { useEventEmitters } from '@/hooks/use-cross-slice-events';
import { habitToasts } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Target,
  FileText,
  Calendar,
  Palette,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

type HabitFormProps = {
  userId: string;
  onHabitCreated?: () => void;
  habit?: import('@/types/habit').Habit | null;
  onHabitUpdated?: () => void;
};

export default function HabitForm({
  userId,
  onHabitCreated,
  habit,
  onHabitUpdated,
}: HabitFormProps) {
  // Cross-slice event integration
  const { emitHabitCreated, emitHabitUpdated } = useEventEmitters();
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>(
    habit?.goal_type || 'daily',
  );
  const [goalTarget, setGoalTarget] = useState<number>(habit?.goal_target || 1);
  const [color, setColor] = useState<string>(habit?.color || '#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setGoalType(habit.goal_type);
      setGoalTarget(habit.goal_target);
      setColor(habit.color);
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (habit) {
        const updatedHabit = await updateHabit(habit.id, {
          name,
          description,
          goal_type: goalType,
          goal_target: goalTarget,
          color,
        });
        
        // Emit cross-slice event for habit update
        emitHabitUpdated({
          habitId: updatedHabit.id,
          userId: updatedHabit.user_id,
          habitName: updatedHabit.name,
          timestamp: new Date(),
        });
        
        // Show toast notification
        habitToasts.updated(updatedHabit.name);
        
        if (onHabitUpdated) onHabitUpdated();
      } else {
        const newHabit = await createHabit({
          user_id: userId,
          name,
          description,
          goal_type: goalType,
          goal_target: goalTarget,
          color: color,
          is_active: true,
        });
        
        // Emit cross-slice event for habit creation
        emitHabitCreated({
          habitId: newHabit.id,
          userId: newHabit.user_id,
          habitName: newHabit.name,
          timestamp: new Date(),
        });
        
        // Show toast notification
        habitToasts.created(newHabit.name);
        
        setName('');
        setDescription('');
        setGoalType('daily');
        setGoalTarget(1);
        setColor('#10B981');
        if (onHabitCreated) onHabitCreated();
      }
    } catch (error) {
      console.error('Error submitting habit:', error);
      setError(
        habit
          ? 'Failed to update habit. Please try again.'
          : 'Failed to create habit. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit Name */}
        <div className="md:col-span-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-slate-700 mb-2 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
            Habit Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter habit name..."
            disabled={isSubmitting}
            className="border-slate-300 focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Habit Description */}
        <div className="md:col-span-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-slate-700 mb-2 block"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your habit..."
            disabled={isSubmitting}
            className="border-slate-300 focus:border-green-500 focus:ring-green-500 min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Goal Type */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            Goal Type
          </Label>
          <Select
            value={goalType}
            onValueChange={(value: any) => setGoalType(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="border-slate-300 focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 shadow-lg">
              <SelectItem value="daily">📅 Daily</SelectItem>
              <SelectItem value="weekly">📊 Weekly</SelectItem>
              <SelectItem value="monthly">📈 Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goal Target */}
        <div>
          <Label
            htmlFor="goalTarget"
            className="text-sm font-medium text-slate-700 mb-2 flex items-center"
          >
            <Target className="w-4 h-4 mr-2 flex-shrink-0" />
            Goal Target
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            type="number"
            id="goalTarget"
            value={goalTarget}
            onChange={(e) => setGoalTarget(Number.parseInt(e.target.value))}
            required
            placeholder="Set target goal"
            min="1"
            disabled={isSubmitting}
            className="border-slate-300 focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Color Picker */}
        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Palette className="w-4 h-4 mr-2 flex-shrink-0" />
            Habit Color
          </Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-10 h-10 rounded-lg border-2 border-slate-300 cursor-pointer shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={isSubmitting}
                aria-label="Choose habit color"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={isSubmitting}
                className="border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showColorPicker ? 'Hide' : 'Choose'} Color
              </Button>
            </div>
            {showColorPicker && (
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || goalTarget < 1}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
              {habit ? 'Updating...' : 'Creating...'}
            </>
          ) : habit ? (
            'Update Habit'
          ) : (
            'Create Habit'
          )}
        </Button>
      </div>
    </form>
  );
}
