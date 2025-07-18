'use client';

import type React from 'react';

import { useState } from 'react';
import { createTask } from '@/lib/tasks';
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
import { Calendar, Clock, Flag, FileText } from 'lucide-react';

type TaskFormProps = {
  userId: string;
  onTaskCreated?: () => void;
};

export default function TaskForm({ userId, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>(
    'pending',
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createTask({
        userId,
        title,
        description,
        status,
        priority,
        dueDate,
      });

      // Reset form fields
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
      setPriority('medium');

      // Notify parent component that a task was created
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Label
            htmlFor="title"
            className="text-sm font-medium text-slate-700 mb-2 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Task Title
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
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
            placeholder="Add task description..."
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
          />
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Status
          </Label>
          <Select
            value={status}
            onValueChange={(value: any) => setStatus(value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-200">
              <SelectItem value="pending">📋 Pending</SelectItem>
              <SelectItem value="in_progress">⚡ In Progress</SelectItem>
              <SelectItem value="completed">✅ Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Flag className="w-4 h-4 mr-2" />
            Priority
          </Label>
          <Select
            value={priority}
            onValueChange={(value: any) => setPriority(value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-200">
              <SelectItem value="low">🟢 Low Priority</SelectItem>
              <SelectItem value="medium">🟡 Medium Priority</SelectItem>
              <SelectItem value="high">🔴 High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="md:col-span-2">
          <Label
            htmlFor="dueDate"
            className="text-sm font-medium text-slate-700 mb-2 flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
