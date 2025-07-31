'use client';

import { useEffect, useState } from 'react';
import { fetchTasks, deleteTask, updateTask } from '@/lib/tasks';
import type { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Trash2,
  Calendar,
  Clock,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type TaskListProps = {
  userId: string;
  refreshKey?: any;
};

const statuses = ['pending', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '📋',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⚡',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅',
  },
};

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🟢',
  },
  medium: {
    label: 'Medium',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🟡',
  },
  high: {
    label: 'High',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴',
  },
};

export default function TaskList({ userId, refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTasks(userId);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [userId, refreshKey]);

  useEffect(() => {
    let filtered = [...tasks];
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }
    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter]);

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed',
  ) => {
    setUpdatingTaskId(taskId);
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status. Please try again.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-800">Tasks</h2>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            {filteredTasks.length}{' '}
            {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>

        {/* Filters - Stack vertically on mobile, horizontally on larger screens */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-600 sm:hidden">
                Filters:
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-300 focus:ring-blue-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusConfig[status as keyof typeof statusConfig].icon}{' '}
                      {statusConfig[status as keyof typeof statusConfig].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-300 focus:ring-blue-500">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg">
                  <SelectItem value="all">All Priority</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {
                        priorityConfig[priority as keyof typeof priorityConfig]
                          .icon
                      }{' '}
                      {
                        priorityConfig[priority as keyof typeof priorityConfig]
                          .label
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            {tasks.length === 0
              ? 'No tasks yet'
              : 'No tasks match your filters'}
          </h3>
          <p className="text-slate-500">
            {tasks.length === 0
              ? 'Create your first task to get started!'
              : 'Try adjusting your filters to see more tasks.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-visible">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-lg transition-all duration-200 border-slate-200 bg-white overflow-visible"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1">
                    {task.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingTaskId === task.id}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label={`Delete task: ${task.title}`}
                  >
                    {deletingTaskId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                  <Badge className={statusConfig[task.status].color}>
                    {statusConfig[task.status].icon}{' '}
                    {statusConfig[task.status].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={priorityConfig[task.priority].color}
                  >
                    {priorityConfig[task.priority].icon}{' '}
                    {priorityConfig[task.priority].label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 overflow-visible">
                {task.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}

                <div className="space-y-3">
                  {/* Status Selector */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          task.id,
                          value as 'pending' | 'in_progress' | 'completed',
                        )
                      }
                      disabled={updatingTaskId === task.id}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-300 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white border border-slate-200 shadow-lg">
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {
                              statusConfig[status as keyof typeof statusConfig]
                                .icon
                            }{' '}
                            {
                              statusConfig[status as keyof typeof statusConfig]
                                .label
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updatingTaskId === task.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-xs text-slate-500">
                    {task.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Created:{' '}
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
