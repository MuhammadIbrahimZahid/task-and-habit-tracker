'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  Target,
  BarChart3,
  Wifi,
  WifiOff,
  Clock,
  CheckSquare,
  Square,
  Calendar,
} from 'lucide-react';
import {
  useTaskEvents,
  useHabitEvents,
  useAnalyticsEvents,
  useEventEmitters,
} from '@/hooks/use-cross-slice-events';
import { taskToasts, habitToasts, analyticsToasts } from '@/lib/toast';

interface TestLog {
  id: string;
  timestamp: Date;
  component: string;
  event: string;
  details: string;
}

export default function GlobalIntegrationTestPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [lastAnalyticsUpdate, setLastAnalyticsUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to prevent duplicate event logging
  const logIdCounter = useRef(0);
  const processedEvents = useRef(new Set<string>());

  // Define fetchAnalyticsData before event listeners
  const fetchAnalyticsData = async () => {
    try {
      console.log('📊 Global Test: Fetching analytics data...');
      const response = await fetch(`/api/analytics/summary?userId=${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Global Test: Analytics data received:', data);
        setAnalyticsData(data);
        setLastAnalyticsUpdate(new Date());
      } else {
        console.error('📊 Global Test: Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('📊 Global Test: Error fetching analytics:', error);
    }
  };

  // Cross-slice event integration
  const {
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskStatusChanged,
    emitHabitCreated,
    emitHabitUpdated,
    emitHabitDeleted,
    emitHabitCompleted,
    emitHabitUncompleted,
    emitAnalyticsRefreshNeeded,
  } = useEventEmitters();

  // Listen to task events
  useTaskEvents((eventType, payload) => {
    const taskPayload = payload as any;
    const eventKey = `${eventType}-${taskPayload.taskId}-${Date.now()}`;

    // Prevent duplicate event logging
    if (processedEvents.current.has(eventKey)) {
      return;
    }
    processedEvents.current.add(eventKey);

    // Clean up old events after 5 seconds
    setTimeout(() => {
      processedEvents.current.delete(eventKey);
    }, 5000);

    const log: TestLog = {
      id: `log-${++logIdCounter.current}`,
      timestamp: new Date(),
      component: 'Global Test',
      event: `TASK_${eventType}`,
      details: `${taskPayload.taskTitle || taskPayload.taskId} - ${taskPayload.userId}`,
    };

    setTestLogs((prev) => [log, ...prev.slice(0, 49)]);

    console.log(`🔗 Global Test: Received ${eventType} event:`, payload);

    // Trigger analytics refresh when tasks change
    if (taskPayload.userId === session?.user?.id) {
      console.log('🔄 Global Test: Triggering analytics refresh due to task change');
      emitAnalyticsRefreshNeeded({
        userId: taskPayload.userId,
        trigger: 'task_change',
        timestamp: new Date(),
      });

      setTimeout(() => {
        fetchAnalyticsData();
      }, 100);
    }
  });

  // Listen to habit events
  useHabitEvents((eventType, payload) => {
    const habitPayload = payload as any;
    const eventKey = `${eventType}-${habitPayload.habitId}-${Date.now()}`;

    // Prevent duplicate event logging
    if (processedEvents.current.has(eventKey)) {
      return;
    }
    processedEvents.current.add(eventKey);

    // Clean up old events after 5 seconds
    setTimeout(() => {
      processedEvents.current.delete(eventKey);
    }, 5000);

    const log: TestLog = {
      id: `log-${++logIdCounter.current}`,
      timestamp: new Date(),
      component: 'Global Test',
      event: `HABIT_${eventType}`,
      details: `${habitPayload.habitName || habitPayload.habitId} - ${habitPayload.userId}`,
    };

    setTestLogs((prev) => [log, ...prev.slice(0, 49)]);

    console.log(`🔗 Global Test: Received ${eventType} event:`, payload);

    // Trigger analytics refresh when habits change
    if (habitPayload.userId === session?.user?.id) {
      console.log('🔄 Global Test: Triggering analytics refresh due to habit change');
      emitAnalyticsRefreshNeeded({
        userId: habitPayload.userId,
        trigger: 'habit_change',
        timestamp: new Date(),
      });

      setTimeout(() => {
        fetchAnalyticsData();
      }, 100);
    }
  });

  // Listen to analytics events
  useAnalyticsEvents((eventType, payload) => {
    const analyticsPayload = payload as any;
    const eventKey = `${eventType}-${analyticsPayload.userId}-${Date.now()}`;

    // Prevent duplicate event logging
    if (processedEvents.current.has(eventKey)) {
      return;
    }
    processedEvents.current.add(eventKey);

    // Clean up old events after 5 seconds
    setTimeout(() => {
      processedEvents.current.delete(eventKey);
    }, 5000);

    const log: TestLog = {
      id: `log-${++logIdCounter.current}`,
      timestamp: new Date(),
      component: 'Global Test',
      event: `ANALYTICS_${eventType}`,
      details: `${analyticsPayload.trigger} - ${analyticsPayload.userId}`,
    };

    setTestLogs((prev) => [log, ...prev.slice(0, 49)]);

    console.log(`🔗 Global Test: Received ${eventType} event:`, payload);

    if (eventType === 'ANALYTICS_REFRESH_NEEDED') {
      console.log('🔄 Global Test: Analytics refresh needed, fetching data...');
      setTimeout(() => {
        fetchAnalyticsData();
      }, 100);
    }
  });

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
      fetchHabits();
      fetchAnalyticsData();
      setIsConnected(true);
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await createClient()
        .from('tasks')
        .select('*')
        .eq('user_id', session?.user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchHabits = async () => {
    try {
      const { data, error } = await createClient()
        .from('habits')
        .select('*')
        .eq('user_id', session?.user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const createTestTask = async () => {
    try {
      const testTask = {
        user_id: session?.user?.id,
        title: `Test Task ${Date.now()}`,
        description: 'Global integration test task',
        status: 'pending',
        priority: 'medium',
        due_date: null,
      };

      const { data, error } = await createClient()
        .from('tasks')
        .insert([testTask])
        .select()
        .single();

      if (error) throw error;

      // Emit cross-slice event
      emitTaskCreated(data.id, data.user_id, data.title);

      // Show toast
      taskToasts.created(data.title);

      // Refresh tasks list
      fetchTasks();

      const log: TestLog = {
        id: `log-${++logIdCounter.current}`,
        timestamp: new Date(),
        component: 'Global Test',
        event: 'TASK_CREATED',
        details: `Created: ${data.title}`,
      };
      setTestLogs((prev) => [log, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error creating test task:', error);
      taskToasts.error('Failed to create test task');
    }
  };

  const createTestHabit = async () => {
    try {
      const testHabit = {
        user_id: session?.user?.id,
        name: `Test Habit ${Date.now()}`,
        description: 'Global integration test habit',
        goal_type: 'daily',
        goal_target: 1,
        color: '#3b82f6',
        is_active: true,
      };

      const { data, error } = await createClient()
        .from('habits')
        .insert([testHabit])
        .select()
        .single();

      if (error) throw error;

      // Emit cross-slice event
      emitHabitCreated({
        habitId: data.id,
        userId: data.user_id,
        habitName: data.name,
        timestamp: new Date(),
      });

      // Show toast
      habitToasts.created(data.name);

      // Refresh habits list
      fetchHabits();

      const log: TestLog = {
        id: `log-${++logIdCounter.current}`,
        timestamp: new Date(),
        component: 'Global Test',
        event: 'HABIT_CREATED',
        details: `Created: ${data.name}`,
      };
      setTestLogs((prev) => [log, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error creating test habit:', error);
      habitToasts.error('Failed to create test habit');
    }
  };

  const deleteTestTask = async (taskId: string, taskTitle: string) => {
    try {
      const { error } = await createClient()
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      // Emit cross-slice event
      emitTaskDeleted(taskId, session?.user?.id, taskTitle);

      // Show toast
      taskToasts.deleted(taskTitle);

      // Refresh tasks list
      fetchTasks();

      const log: TestLog = {
        id: `log-${++logIdCounter.current}`,
        timestamp: new Date(),
        component: 'Global Test',
        event: 'TASK_DELETED',
        details: `Deleted: ${taskTitle}`,
      };
      setTestLogs((prev) => [log, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error deleting test task:', error);
      taskToasts.error(`Failed to delete ${taskTitle}`);
    }
  };

  const deleteTestHabit = async (habitId: string, habitName: string) => {
    try {
      const { error } = await createClient()
        .from('habits')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', habitId);

      if (error) throw error;

      // Emit cross-slice event
      emitHabitDeleted({
        habitId,
        userId: session?.user?.id,
        habitName,
        timestamp: new Date(),
      });

      // Show toast
      habitToasts.deleted(habitName);

      // Refresh habits list
      fetchHabits();

      const log: TestLog = {
        id: `log-${++logIdCounter.current}`,
        timestamp: new Date(),
        component: 'Global Test',
        event: 'HABIT_DELETED',
        details: `Deleted: ${habitName}`,
      };
      setTestLogs((prev) => [log, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error deleting test habit:', error);
      habitToasts.error(`Failed to delete ${habitName}`);
    }
  };

  const triggerAnalyticsRefresh = () => {
    console.log('🔗 Global Test: Manual analytics refresh triggered');
    emitAnalyticsRefreshNeeded({
      userId: session?.user?.id,
      trigger: 'manual',
      timestamp: new Date(),
    });

    fetchAnalyticsData();

    const log: TestLog = {
      id: `log-${++logIdCounter.current}`,
      timestamp: new Date(),
      component: 'Global Test',
      event: 'ANALYTICS_REFRESH_NEEDED',
      details: 'Manual refresh triggered',
    };
    setTestLogs((prev) => [log, ...prev.slice(0, 49)]);

    analyticsToasts.refreshed();
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Please sign in to test global integration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Integration Test</h1>
          <p className="text-muted-foreground">
            Testing cross-slice events across all components (tasks, habits, analytics)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Tasks ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={createTestTask} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Create Test Task
              </Button>
              <Button onClick={fetchTasks} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteTestTask(task.id, task.title)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No tasks found. Create a test task to see cross-slice events.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Habits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Habits ({habits.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={createTestHabit} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Create Test Habit
              </Button>
              <Button onClick={fetchHabits} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{habit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteTestHabit(habit.id, habit.name)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No habits found. Create a test habit to see cross-slice events.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
              {lastAnalyticsUpdate && (
                <Badge variant="outline" className="ml-auto">
                  <Clock className="w-3 h-3 mr-1" />
                  {lastAnalyticsUpdate.toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={triggerAnalyticsRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Trigger Analytics Refresh
            </Button>

            {analyticsData && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analyticsData.total_tasks || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="font-medium">Total Habits</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analyticsData.total_habits || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Global Cross-Slice Event Log</span>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2 border rounded text-sm"
              >
                <Badge variant="outline" className="text-xs">
                  {log.component}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {log.event}
                </Badge>
                <span className="flex-1">{log.details}</span>
                <span className="text-muted-foreground text-xs">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            {testLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No events logged yet. Perform actions to see global cross-slice events.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Global Integration Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Create Test Task:</strong> Click "Create Test Task" to trigger TASK_CREATED event and analytics refresh
          </p>
          <p>
            <strong>2. Create Test Habit:</strong> Click "Create Test Habit" to trigger HABIT_CREATED event and analytics refresh
          </p>
          <p>
            <strong>3. Delete Items:</strong> Click trash icons to trigger DELETE events and analytics refresh
          </p>
          <p>
            <strong>4. Analytics Refresh:</strong> Click "Trigger Analytics Refresh" to manually refresh analytics
          </p>
          <p>
            <strong>5. Watch Event Log:</strong> All cross-slice events from tasks, habits, and analytics will appear in the log
          </p>
          <p>
            <strong>6. Real-time Updates:</strong> Events from other components and pages will also appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 