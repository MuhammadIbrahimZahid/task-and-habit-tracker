'use client';
import { useEffect, useState } from 'react';
import { fetchTasks, deleteTask } from '@/lib/tasks';
import { Task } from '@/types/task';

type TaskListProps = {
  userId: string;
  refreshKey?: any;
};

export default function TaskList({ userId, refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await fetchTasks(userId);
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    loadTasks();
  }, [userId, refreshKey]); // Reload tasks whenever refreshKey changes

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
            <p className="text-gray-600 mt-1">
              {task.description || 'No description provided.'}
            </p>

            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <p>
                Status:{' '}
                <span className="capitalize">
                  {task.status.replace('_', ' ')}
                </span>
              </p>
              <p>
                Priority: <span className="capitalize">{task.priority}</span>
              </p>
              {task.due_date && (
                <p>Due: {new Date(task.due_date).toLocaleString()}</p>
              )}
              <p>Created: {new Date(task.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(task.updated_at).toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={() => handleDelete(task.id)}
            className="mt-4 self-end text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
