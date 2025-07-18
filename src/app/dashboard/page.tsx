'use client';

import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/ui/TaskForm';
import TaskList from '@/components/ui/TaskList';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Plus, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [tasksUpdatedAt, setTasksUpdatedAt] = useState(Date.now());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
      }
    };

    getSession();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in');
  }

  // Called when a new task is created to trigger TaskList refresh
  const onTaskCreated = () => {
    setTasksUpdatedAt(Date.now());
    setShowTaskForm(false);
  };

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600 text-lg">Please sign in first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">My Tasks</h1>
            <p className="text-slate-600">
              Organize and track your tasks efficiently
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Task Form - Collapsible */}
        {showTaskForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Create New Task
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTaskForm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>
            <TaskForm userId={session.user.id} onTaskCreated={onTaskCreated} />
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <TaskList userId={session.user.id} refreshKey={tasksUpdatedAt} />
        </div>
      </div>
    </div>
  );
}
