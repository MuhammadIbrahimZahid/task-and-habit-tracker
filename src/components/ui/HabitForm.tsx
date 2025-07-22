'use client';

import type React from 'react';
import { useEffect } from 'react';

import { useState } from 'react';
import { createHabit, updateHabit } from '@/lib/habits';
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
import { Target, FileText, Calendar, Palette } from 'lucide-react';
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
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>(
    habit?.goal_type || 'daily',
  );
  const [goalTarget, setGoalTarget] = useState<number>(habit?.goal_target || 1);
  const [color, setColor] = useState<string>(habit?.color || '#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
    try {
      if (habit) {
        await updateHabit(habit.id, {
          name,
          description,
          goal_type: goalType,
          goal_target: goalTarget,
          color,
        });
        if (onHabitUpdated) onHabitUpdated();
      } else {
        await createHabit({
          user_id: userId,
          name,
          description,
          goal_type: goalType,
          goal_target: goalTarget,
          color: color,
          is_active: true,
        });
        setName('');
        setDescription('');
        setGoalType('daily');
        setGoalTarget(1);
        setColor('#10B981');
        if (onHabitCreated) onHabitCreated();
      }
    } catch (error) {
      console.error('Error submitting habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit Name */}
        <div className="md:col-span-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-slate-700 mb-2 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Habit Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter habit name..."
            className="border-slate-300 focus:border-green-500 focus:ring-green-500"
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
            className="border-slate-300 focus:border-green-500 focus:ring-green-500 min-h-[100px]"
          />
        </div>

        {/* Goal Type */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Goal Type
          </Label>
          <Select
            value={goalType}
            onValueChange={(value: any) => setGoalType(value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            <Target className="w-4 h-4 mr-2" />
            Goal Target
          </Label>
          <Input
            type="number"
            id="goalTarget"
            value={goalTarget}
            onChange={(e) => setGoalTarget(Number.parseInt(e.target.value))}
            required
            placeholder="Set target goal"
            min="1"
            className="border-slate-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        {/* Color Picker */}
        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Habit Color
          </Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-slate-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="border-slate-300"
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

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting
            ? habit
              ? 'Updating...'
              : 'Creating...'
            : habit
              ? 'Update Habit'
              : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
}
