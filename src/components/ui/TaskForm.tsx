'use client';
import { useState } from 'react';
import { createTask } from '@/lib/tasks';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as any)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Task
      </button>
    </form>
  );
}
