'use client';

import { signOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/ui/TaskForm';
import TaskList from '@/components/ui/TaskList';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import {
  Plus,
  LogOut,
  LayoutList,
  Repeat,
  ArrowLeft,
  List,
  Eye,
} from 'lucide-react';
import HabitForm from '@/components/ui/HabitForm';
import HabitList from '@/components/ui/HabitList';
import HabitDetails from '@/components/ui/HabitDetails';
import type { Habit } from '@/types/habit';
import HabitTracker from '@/components/ui/HabitTracker';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [activeSlice, setActiveSlice] = useState<'tasks' | 'habits'>('tasks');
  const [tasksUpdatedAt, setTasksUpdatedAt] = useState(Date.now());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitsUpdatedAt, setHabitsUpdatedAt] = useState(Date.now());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitViewMode, setHabitViewMode] = useState<'list' | 'detail'>('list');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
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

  // Task slice handlers
  const onTaskCreated = () => {
    setTasksUpdatedAt(Date.now());
    setShowTaskForm(false);
  };

  // Habit slice handlers
  const onHabitCreated = () => {
    setHabitsUpdatedAt(Date.now());
    setShowHabitForm(false);
  };
  const onHabitUpdated = () => {
    setHabitsUpdatedAt(Date.now());
    setEditingHabit(null);
    setShowHabitForm(false);
  };

  // Handle habit selection and view switching
  const handleHabitSelect = (habitId: string) => {
    setSelectedHabitId(habitId);
    setHabitViewMode('detail');
  };

  const handleBackToHabitList = () => {
    setHabitViewMode('list');
    setSelectedHabitId(null);
  };

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600 text-lg">Please sign in first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white/80 backdrop-blur-lg border-r border-slate-200 shadow-lg flex flex-col items-center py-8 px-2 md:px-6 gap-8">
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-lg md:text-base ${
              activeSlice === 'tasks'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            onClick={() => setActiveSlice('tasks')}
          >
            <LayoutList className="w-6 h-6 md:mr-2" />
            <span className="hidden md:inline">Tasks</span>
          </button>
          <button
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-lg md:text-base ${
              activeSlice === 'habits'
                ? 'bg-green-600 text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            onClick={() => setActiveSlice('habits')}
          >
            <Repeat className="w-6 h-6 md:mr-2" />
            <span className="hidden md:inline">Habits</span>
          </button>
        </div>
        <div className="flex-1" />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10">
        {activeSlice === 'tasks' && (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                  My Tasks
                </h1>
                <p className="text-slate-600">
                  Organize and track your tasks efficiently
                </p>
              </div>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Task</span>
              </button>
            </div>

            {/* Task Form - Collapsible */}
            {showTaskForm && (
              <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Create New Task
                  </h2>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="text-slate-500 hover:text-slate-700 text-xl px-2"
                  >
                    ✕
                  </button>
                </div>
                <TaskForm
                  userId={session.user.id}
                  onTaskCreated={onTaskCreated}
                />
              </div>
            )}

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <TaskList userId={session.user.id} refreshKey={tasksUpdatedAt} />
            </div>
          </div>
        )}

        {activeSlice === 'habits' && (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">
                    My Habits
                  </h1>
                  <p className="text-slate-600">
                    Build and track your habits for a better you
                  </p>
                </div>
                {/* View Toggle Buttons - Only show when habit is selected */}
                {selectedHabitId && (
                  <div className="flex items-center gap-2 ml-8">
                    <button
                      onClick={() => setHabitViewMode('list')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        habitViewMode === 'list'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      List View
                    </button>
                    <button
                      onClick={() => setHabitViewMode('detail')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        habitViewMode === 'detail'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Detail View
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowHabitForm(!showHabitForm);
                  setEditingHabit(null);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Habit</span>
              </button>
            </div>
            {/* Habit Form - Collapsible (Create) */}
            {showHabitForm && !editingHabit && (
              <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Create New Habit
                  </h2>
                  <button
                    onClick={() => setShowHabitForm(false)}
                    className="text-slate-500 hover:text-slate-700 text-xl px-2"
                  >
                    ✕
                  </button>
                </div>
                <HabitForm
                  userId={session.user.id}
                  onHabitCreated={onHabitCreated}
                />
              </div>
            )}
            {/* Habit Form - Edit Mode */}
            {editingHabit && (
              <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Edit Habit
                  </h2>
                  <button
                    onClick={() => setEditingHabit(null)}
                    className="text-slate-500 hover:text-slate-700 text-xl px-2"
                  >
                    ✕
                  </button>
                </div>
                <HabitForm
                  userId={session.user.id}
                  habit={editingHabit}
                  onHabitUpdated={onHabitUpdated}
                />
              </div>
            )}
            {/* Habit Content - Toggle between List and Detail views */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              {habitViewMode === 'list' ? (
                // List View
                <HabitList
                  userId={session.user.id}
                  refreshKey={habitsUpdatedAt}
                  onSelect={handleHabitSelect}
                  selectedHabitId={selectedHabitId}
                  onEdit={(habit) => {
                    setEditingHabit(habit);
                    setShowHabitForm(false);
                  }}
                />
              ) : (
                // Detail View
                selectedHabitId && (
                  <div className="animate-in fade-in duration-300">
                    {/* Back Button */}
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={handleBackToHabitList}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Habits
                      </button>
                      <div className="h-4 w-px bg-slate-300" />
                      <span className="text-sm text-slate-500">
                        Habit Details & Tracker
                      </span>
                    </div>
                    {/* Habit Details */}
                    <div className="mb-8">
                      <HabitDetails
                        habitId={selectedHabitId}
                        onEdit={(habit) => {
                          setEditingHabit(habit);
                          setShowHabitForm(false);
                        }}
                      />
                    </div>
                    {/* Habit Tracker */}
                    <HabitTracker habitId={selectedHabitId} />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
