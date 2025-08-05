'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Bell,
  Activity,
  Play,
  Square,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  useCrossSliceEvent,
  useTaskEvents,
  useHabitEvents,
  useAnalyticsEvents,
  useEventEmitters,
  useCrossSliceDebug,
} from '@/hooks/use-cross-slice-events';
import type { EventPayload } from '@/lib/cross-slice-events';

export default function CrossSliceTestPage() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [userId] = useState('test-user-123'); // Mock user ID for testing

  // Get event emitters
  const {
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskStatusChanged,
    emitHabitCreated,
    emitHabitCompleted,
    emitHabitUncompleted,
    emitHabitDeleted,
    emitAnalyticsRefreshNeeded,
    emitAnalyticsDataUpdated,
  } = useEventEmitters();

  // Get debug information
  const { debugInfo, activeEventTypes, totalListeners, clearAll } =
    useCrossSliceDebug();

  // Subscribe to specific events for testing
  useCrossSliceEvent('TASK_CREATED', (payload: EventPayload) => {
    const logEntry = `📝 Task Created: ${(payload as any).taskTitle || 'Unknown Task'}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]); // Keep last 20
  });

  useCrossSliceEvent('HABIT_COMPLETED', (payload: EventPayload) => {
    const logEntry = `✅ Habit Completed: ${(payload as any).habitName || 'Unknown Habit'}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  });

  useCrossSliceEvent('ANALYTICS_REFRESH_NEEDED', (payload: EventPayload) => {
    const logEntry = `📊 Analytics Refresh: ${(payload as any).trigger}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  });

  // Subscribe to all task events
  useTaskEvents((eventType, payload) => {
    const logEntry = `🎯 ${eventType}: ${payload.timestamp.toLocaleTimeString()}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  });

  // Subscribe to all habit events
  useHabitEvents((eventType, payload) => {
    const logEntry = `🔄 ${eventType}: ${payload.timestamp.toLocaleTimeString()}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  });

  // Subscribe to all analytics events
  useAnalyticsEvents((eventType, payload) => {
    const logEntry = `📈 ${eventType}: ${payload.timestamp.toLocaleTimeString()}`;
    setEventLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  });

  const addLogEntry = (message: string) => {
    setEventLog((prev) => [message, ...prev.slice(0, 19)]);
  };

  const clearLog = () => {
    setEventLog([]);
  };

  const testTaskEvents = () => {
    addLogEntry('🧪 Testing Task Events...');

    // Test task created
    emitTaskCreated('task-1', userId, 'Test Task 1');

    setTimeout(() => {
      emitTaskUpdated('task-1', userId, 'Updated Test Task 1');
    }, 500);

    setTimeout(() => {
      emitTaskStatusChanged('task-1', userId, 'pending', 'completed');
    }, 1000);

    setTimeout(() => {
      emitTaskDeleted('task-1', userId, 'Updated Test Task 1');
    }, 1500);
  };

  const testHabitEvents = () => {
    addLogEntry('🧪 Testing Habit Events...');

    // Test habit created
    emitHabitCreated({
      habitId: 'habit-1',
      userId,
      habitName: 'Test Habit 1',
      timestamp: new Date(),
    });

    setTimeout(() => {
      emitHabitCompleted({
        habitId: 'habit-1',
        userId,
        habitName: 'Test Habit 1',
        eventDate: '2024-01-15',
        timestamp: new Date(),
      });
    }, 500);

    setTimeout(() => {
      emitHabitUncompleted({
        habitId: 'habit-1',
        userId,
        habitName: 'Test Habit 1',
        eventDate: '2024-01-15',
        timestamp: new Date(),
      });
    }, 1000);

    setTimeout(() => {
      emitHabitDeleted({
        habitId: 'habit-1',
        userId,
        habitName: 'Test Habit 1',
        timestamp: new Date(),
      });
    }, 1500);
  };

  const testAnalyticsEvents = () => {
    addLogEntry('🧪 Testing Analytics Events...');

    // Test analytics refresh needed
    emitAnalyticsRefreshNeeded({
      userId,
      trigger: 'task_change',
      timestamp: new Date(),
    });

    setTimeout(() => {
      emitAnalyticsRefreshNeeded({
        userId,
        trigger: 'habit_change',
        timestamp: new Date(),
      });
    }, 500);

    setTimeout(() => {
      emitAnalyticsDataUpdated({
        userId,
        trigger: 'manual',
        timestamp: new Date(),
      });
    }, 1000);

    setTimeout(() => {
      emitAnalyticsDataUpdated({
        userId,
        trigger: 'real_time',
        timestamp: new Date(),
      });
    }, 1500);
  };

  const testComprehensiveFlow = async () => {
    addLogEntry('🧪 Starting Comprehensive Test...');

    // Test task creation
    emitTaskCreated('comprehensive-task', userId, 'Comprehensive Test Task');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test habit completion
    emitHabitCompleted({
      habitId: 'comprehensive-habit',
      userId,
      habitName: 'Comprehensive Test Habit',
      eventDate: '2024-01-15',
      timestamp: new Date()
    });
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test analytics refresh
    emitAnalyticsRefreshNeeded({
      userId,
      trigger: 'task_change',
      timestamp: new Date()
    });
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test task status change
    emitTaskStatusChanged(
      'comprehensive-task',
      userId,
      'pending',
      'in_progress',
    );
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test habit uncompletion
    emitHabitUncompleted({
      habitId: 'comprehensive-habit',
      userId,
      habitName: 'Comprehensive Test Habit',
      eventDate: '2024-01-15',
      timestamp: new Date()
    });
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test analytics data update
    emitAnalyticsDataUpdated({
      userId,
      trigger: 'real_time',
      timestamp: new Date()
    });

    addLogEntry('✅ Comprehensive Test Completed');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Cross-Slice Event System Test
        </h1>
        <p className="text-muted-foreground">
          Test the event-driven communication between different components
        </p>
      </div>

      {/* Status and Debug Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Event System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total Listeners:</span>
                <Badge variant="outline">{totalListeners}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Event Types:</span>
                <Badge variant="outline">{activeEventTypes.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Event Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(debugInfo).map(([eventType, count]) => (
                <div key={eventType} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{eventType}:</span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Event Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Events:</span>
                <Badge variant="outline" className="text-xs">
                  {eventLog.length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Event:</span>
                <span className="text-xs">
                  {eventLog.length > 0 ? eventLog[0].split(' ')[0] : 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button onClick={testTaskEvents} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Test Task Events
        </Button>

        <Button onClick={testHabitEvents} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Test Habit Events
        </Button>

        <Button
          onClick={testAnalyticsEvents}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Test Analytics Events
        </Button>

        <Button
          onClick={testComprehensiveFlow}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Activity className="h-4 w-4" />
          Comprehensive Test
        </Button>

        <Button onClick={clearLog} variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
          Clear Log
        </Button>

        <Button onClick={clearAll} variant="outline" size="sm">
          <Square className="h-4 w-4" />
          Clear All Events
        </Button>
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events logged yet.
              </p>
            ) : (
              eventLog.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-mono">{entry}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>
            1. <strong>Task Events:</strong> Test task creation, updates, status
            changes, and deletion
          </li>
          <li>
            2. <strong>Habit Events:</strong> Test habit creation, completion,
            uncompletion, and deletion
          </li>
          <li>
            3. <strong>Analytics Events:</strong> Test analytics refresh and
            data update triggers
          </li>
          <li>
            4. <strong>Comprehensive Test:</strong> Test the full event flow
            across all components
          </li>
          <li>
            5. <strong>Event Log:</strong> Monitor real-time event logging and
            system status
          </li>
          <li>
            6. <strong>Debug Info:</strong> Check listener counts and active
            event types
          </li>
          <li>
            7. <strong>Cleanup:</strong> Test event system cleanup and memory
            management
          </li>
        </ol>
      </div>

      {/* System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">System Status:</h3>
        <div className="space-y-1 text-sm text-green-700">
          <div>• Event System: Active</div>
          <div>• Total Listeners: {totalListeners}</div>
          <div>• Active Event Types: {activeEventTypes.length}</div>
          <div>• Event Log Entries: {eventLog.length}</div>
          <div>• Memory Management: Automatic cleanup enabled</div>
          <div>• Type Safety: Full TypeScript support</div>
        </div>
      </div>
    </div>
  );
}
