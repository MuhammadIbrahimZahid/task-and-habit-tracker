'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  subscribeToTasks,
  subscribeToHabits,
  subscribeToHabitEvents,
  subscribeToAnalytics,
  cleanupUserSubscriptions,
  getSubscriptionStatus,
  type SubscriptionHandle,
} from '@/lib/realtime-subscriptions';
import { realtimeToasts } from '@/lib/toast';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { createTask, deleteTask } from '@/lib/tasks';
import type { Task } from '@/types/task';

export default function SubscriptionTestPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionHandle[]>([]);
  const [status, setStatus] = useState(getSubscriptionStatus());
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get authenticated user
    const supabase = createClient();
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          addEvent('❌ Authentication error: ' + error.message);
        } else if (session?.user?.id) {
          setUserId(session.user.id);
          setIsAuthenticated(true);
          addEvent('✅ Authenticated as: ' + session.user.email);
        } else {
          addEvent('⚠️ Not authenticated. Some features may not work.');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        addEvent('❌ Failed to get authentication session');
      }
    };

    getSession();

    // Update status every 2 seconds
    const interval = setInterval(() => {
      setStatus(getSubscriptionStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  const handleEvent = (payload: RealtimePostgresChangesPayload<any>) => {
    const eventType = payload.eventType;
    const table = payload.table;
    const record = payload.new || payload.old;

    console.log('📡 Real-time event received:', payload);
    addEvent(`📡 ${eventType} on ${table}: ${JSON.stringify(record)}`);

    // Add more detailed logging
    if (eventType === 'INSERT') {
      addEvent(`🎉 New ${table} created: ${record?.title || record?.id}`);
    } else if (eventType === 'UPDATE') {
      addEvent(`✏️ ${table} updated: ${record?.title || record?.id}`);
    } else if (eventType === 'DELETE') {
      addEvent(`🗑️ ${table} deleted: ${record?.title || record?.id}`);
    }
  };

  const handleError = (error: Error) => {
    addEvent(`❌ Error: ${error.message}`);
    realtimeToasts.error(error.message);
  };

  const testTasksSubscription = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    setIsLoading(true);
    try {
      addEvent('🔌 Testing tasks subscription...');

      const subscription = await subscribeToTasks(
        userId,
        handleEvent,
        handleError,
      );

      setSubscriptions((prev) => {
        const newSubscriptions = [...prev, subscription];
        addEvent(`📊 Updated subscriptions count: ${newSubscriptions.length}`);
        return newSubscriptions;
      });

      addEvent('✅ Tasks subscription created successfully');
      realtimeToasts.connected();
    } catch (error) {
      addEvent(
        `❌ Failed to create tasks subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testHabitsSubscription = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    setIsLoading(true);
    try {
      addEvent('🔌 Testing habits subscription...');

      const subscription = await subscribeToHabits(
        userId,
        handleEvent,
        handleError,
      );

      setSubscriptions((prev) => [...prev, subscription]);
      addEvent('✅ Habits subscription created successfully');
      realtimeToasts.connected();
    } catch (error) {
      addEvent(
        `❌ Failed to create habits subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testHabitEventsSubscription = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    setIsLoading(true);
    try {
      addEvent('🔌 Testing habit events subscription...');

      const subscription = await subscribeToHabitEvents(
        userId,
        handleEvent,
        handleError,
      );

      setSubscriptions((prev) => [...prev, subscription]);
      addEvent('✅ Habit events subscription created successfully');
      realtimeToasts.connected();
    } catch (error) {
      addEvent(
        `❌ Failed to create habit events subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testAnalyticsSubscription = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    setIsLoading(true);
    try {
      addEvent('🔌 Testing analytics subscription (all tables)...');

      const analyticsSubscriptions = await subscribeToAnalytics(
        userId,
        handleEvent,
        handleError,
      );

      setSubscriptions((prev) => [...prev, ...analyticsSubscriptions]);
      addEvent(
        `✅ Analytics subscriptions created successfully (${analyticsSubscriptions.length} channels)`,
      );
      realtimeToasts.connected();
    } catch (error) {
      addEvent(
        `❌ Failed to create analytics subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromChannel = async (subscription: SubscriptionHandle) => {
    try {
      addEvent(`🔌 Unsubscribing from ${subscription.channelName}...`);
      await subscription.unsubscribe();
      setSubscriptions((prev) =>
        prev.filter((sub) => sub.channelName !== subscription.channelName),
      );
      addEvent(`✅ Successfully unsubscribed from ${subscription.channelName}`);
    } catch (error) {
      addEvent(
        `❌ Failed to unsubscribe from ${subscription.channelName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const cleanupAll = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    addEvent(
      `🧹 Starting cleanup for ${subscriptions.length} subscriptions...`,
    );

    try {
      addEvent('🧹 Cleaning up all user subscriptions...');
      await cleanupUserSubscriptions(userId);
      setSubscriptions([]);
      addEvent('✅ All user subscriptions cleaned up');
      realtimeToasts.connected();
    } catch (error) {
      addEvent(
        `❌ Failed to cleanup subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const testDatabaseOperation = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user. Please sign in first.');
      return;
    }

    try {
      addEvent('🧪 Testing real database operation...');

      // Create a real test task
      const taskData = {
        userId,
        title: `Test Task ${Date.now()}`,
        description: 'This is a test task for real-time subscription testing',
        status: 'pending' as const,
        priority: 'medium' as const,
      };

      addEvent('📝 Creating test task in database...');
      const newTask = await createTask(taskData);

      addEvent(`🔍 Task creation result: ${JSON.stringify(newTask)}`);

      if (!newTask) {
        throw new Error(
          'Task creation returned null - check database permissions',
        );
      }

      // Type assertion after null check
      const task = newTask as Task;
      addEvent(`✅ Created test task: ${task.title} (ID: ${task.id})`);

      // Delete the task after 3 seconds
      setTimeout(async () => {
        try {
          addEvent('🗑️ Deleting test task from database...');
          await deleteTask(task.id);
          addEvent(`✅ Deleted test task: ${task.title}`);
        } catch (error) {
          addEvent(
            `❌ Failed to delete test task: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }, 3000);
    } catch (error) {
      addEvent(
        `❌ Failed to create test task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Subscription Utilities Test
          </h1>
          <p className="text-slate-600">
            Test the subscription wrapper utilities for real-time integration.
          </p>
        </div>

        {/* Authentication & Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Authentication & Connection Status
              <div className="flex gap-2">
                <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
                <Badge
                  variant={
                    status.connectionStatus.isConnected
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {status.connectionStatus.isConnected
                    ? 'Connected'
                    : 'Disconnected'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Connection Details
                </h4>
                <div className="space-y-1 text-sm">
                  <div>
                    Status:{' '}
                    {status.connectionStatus.isConnected
                      ? 'Connected'
                      : 'Disconnected'}
                  </div>
                  <div>
                    Connecting:{' '}
                    {status.connectionStatus.isConnecting ? 'Yes' : 'No'}
                  </div>
                  <div>
                    Reconnect Attempts:{' '}
                    {status.connectionStatus.reconnectAttempts}
                  </div>
                  {userId && (
                    <div>
                      User ID:{' '}
                      <span className="font-mono text-xs">{userId}</span>
                    </div>
                  )}
                  {status.connectionStatus.error && (
                    <div className="text-red-600">
                      Error: {status.connectionStatus.error}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Active Channels ({status.activeChannels.length})
                </h4>
                <div className="space-y-1">
                  {status.activeChannels.length === 0 ? (
                    <span className="text-slate-400 text-sm">
                      No active channels
                    </span>
                  ) : (
                    status.activeChannels.map((channel) => (
                      <div
                        key={channel}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {channel}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <Button
                onClick={testTasksSubscription}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Test Tasks
              </Button>
              <Button
                onClick={testHabitsSubscription}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Test Habits
              </Button>
              <Button
                onClick={testHabitEventsSubscription}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Test Habit Events
              </Button>
              <Button
                onClick={testAnalyticsSubscription}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Test Analytics
              </Button>
              <Button
                onClick={testDatabaseOperation}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Test DB Operation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🔌 Active Subscriptions ({subscriptions.length})
              <div className="flex gap-2">
                <Button
                  onClick={cleanupAll}
                  variant="destructive"
                  size="sm"
                  disabled={subscriptions.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Cleanup All ({subscriptions.length})
                </Button>
                <span className="text-xs text-slate-500">
                  Debug: {subscriptions.length} subs
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No active subscriptions. Create some subscriptions to see them
                here.
              </p>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.channelName}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${subscription.isActive() ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span className="font-mono text-sm">
                        {subscription.channelName}
                      </span>
                      <Badge
                        variant={
                          subscription.isActive() ? 'default' : 'secondary'
                        }
                      >
                        {subscription.isActive() ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => unsubscribeFromChannel(subscription)}
                      variant="outline"
                      size="sm"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              📋 Event Log ({events.length})
              <Button onClick={clearEvents} variant="outline" size="sm">
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
              {events.length === 0 ? (
                <span className="text-slate-500">
                  No events yet. Create subscriptions and trigger database
                  changes to see events here.
                </span>
              ) : (
                <div className="space-y-1">
                  {events.map((event, index) => (
                    <div key={index}>{event}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong>1. Test Individual Subscriptions:</strong> Click the
                test buttons to create subscriptions for specific tables.
              </p>
              <p>
                <strong>2. Test Analytics Subscription:</strong> Creates
                subscriptions for all analytics-relevant tables at once.
              </p>
              <p>
                <strong>3. Test Database Operations:</strong> Use "Test DB
                Operation" to create and delete real tasks in your database
                (requires authentication).
              </p>
              <p>
                <strong>4. Monitor Events:</strong> Watch the event log for
                real-time events when database changes occur.
              </p>
              <p>
                <strong>5. Test Cleanup:</strong> Use "Cleanup All" to remove
                all subscriptions for the test user.
              </p>
              <p>
                <strong>6. Cross-Tab Testing:</strong> Open multiple browser
                tabs to test real-time synchronization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
