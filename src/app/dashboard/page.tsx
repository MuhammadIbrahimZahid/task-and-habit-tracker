'use client';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/ui/TaskForm';
import TaskList from '@/components/ui/TaskList';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [tasksUpdatedAt, setTasksUpdatedAt] = useState(Date.now());
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
  };

  if (!session?.user?.id) {
    return <p className="text-center mt-10">Please sign in first.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <Button
            onClick={handleSignOut}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign Out
          </Button>
        </header>

        {/* Task Form */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Create a New Task
          </h2>
          <TaskForm userId={session.user.id} onTaskCreated={onTaskCreated} />
        </div>

        {/* Task List */}
        <div>
          <TaskList userId={session.user.id} refreshKey={tasksUpdatedAt} />
        </div>
      </div>
    </div>
  );
}
