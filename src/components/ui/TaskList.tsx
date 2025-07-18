'use client';
import { useEffect, useState } from 'react';
import { fetchTasks, deleteTask, updateTask } from '@/lib/tasks';
import { Task } from '@/types/task';

type TaskListProps = {
  userId: string;
  refreshKey?: any;
};

const statuses = ['pending', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

export default function TaskList({ userId, refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks(userId);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    loadTasks();
  }, [userId, refreshKey]);

  useEffect(() => {
    let filtered = [...tasks];
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }
    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter]);

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed',
  ) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="mt-4">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 border rounded px-2 py-1"
          >
            <option value="">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700">
            Filter by Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="mt-1 border rounded px-2 py-1"
          >
            <option value="">All</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
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
                <div>
                  <label className="mr-2">Status:</label>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value as
                          | 'pending'
                          | 'in_progress'
                          | 'completed',
                      )
                    }
                    className="border rounded px-1 py-0.5 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
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
    </div>
  );
}
