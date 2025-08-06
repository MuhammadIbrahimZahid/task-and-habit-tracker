/**
 * React Hook for Cross-Slice Events
 *
 * Provides a convenient way to subscribe to and emit cross-slice events
 * with automatic cleanup when the component unmounts.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  crossSliceEvents,
  taskEvents,
  habitEvents,
  analyticsEvents,
  type EventType,
  type EventListener,
  type EventPayload,
  type SubscriptionHandle,
} from '@/lib/cross-slice-events';

/**
 * Hook for subscribing to cross-slice events
 * @param eventType The type of event to listen for
 * @param listener The callback function to execute when the event occurs
 * @param dependencies Optional dependencies array for the listener function
 */
export function useCrossSliceEvent(
  eventType: EventType,
  listener: EventListener,
  dependencies: React.DependencyList = [],
) {
  const subscriptionRef = useRef<SubscriptionHandle | null>(null);

  // Memoize the listener to prevent unnecessary re-subscriptions
  const memoizedListener = useCallback(listener, dependencies);

  useEffect(() => {
    // Subscribe to the event
    subscriptionRef.current = crossSliceEvents.subscribe(
      eventType,
      memoizedListener,
    );

    // Cleanup function to unsubscribe when component unmounts or dependencies change
    return () => {
      if (subscriptionRef.current) {
        crossSliceEvents.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [eventType, memoizedListener]);

  // Return the subscription handle for manual control if needed
  return subscriptionRef.current;
}

/**
 * Hook for subscribing to multiple cross-slice events
 * @param subscriptions Array of event subscriptions
 * @returns Array of subscription handles
 */
export function useCrossSliceEvents(
  subscriptions: Array<{
    eventType: EventType;
    listener: EventListener;
    dependencies?: React.DependencyList;
  }>,
) {
  const subscriptionRefs = useRef<(SubscriptionHandle | null)[]>([]);

  useEffect(() => {
    // Subscribe to all events
    subscriptionRefs.current = subscriptions.map(({ eventType, listener }) =>
      crossSliceEvents.subscribe(eventType, listener),
    );

    // Cleanup function to unsubscribe from all events
    return () => {
      subscriptionRefs.current.forEach((handle) => {
        if (handle) {
          crossSliceEvents.unsubscribe(handle);
        }
      });
      subscriptionRefs.current = [];
    };
  }, [subscriptions]);

  return subscriptionRefs.current;
}

/**
 * Hook for task-related cross-slice events
 * @param listener The callback function to execute when task events occur
 * @param dependencies Optional dependencies array for the listener function
 */
export function useTaskEvents(
  listener: (eventType: EventType, payload: EventPayload) => void,
  dependencies: React.DependencyList = [],
) {
  const memoizedListener = useCallback(listener, dependencies);

  useEffect(() => {
    const handles: SubscriptionHandle[] = [];

    // Subscribe to all task events
    const taskEventTypes: EventType[] = [
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'TASK_STATUS_CHANGED',
    ];

    taskEventTypes.forEach((eventType) => {
      const wrappedListener = (payload: EventPayload) => {
        memoizedListener(eventType, payload);
      };
      handles.push(crossSliceEvents.subscribe(eventType, wrappedListener));
    });

    // Cleanup function
    return () => {
      handles.forEach((handle) => crossSliceEvents.unsubscribe(handle));
    };
  }, [memoizedListener]);
}

/**
 * Hook for habit-related cross-slice events
 * @param listener The callback function to execute when habit events occur
 * @param dependencies Optional dependencies array for the listener function
 */
export function useHabitEvents(
  listener: (eventType: EventType, payload: EventPayload) => void,
  dependencies: React.DependencyList = [],
) {
  const memoizedListener = useCallback(listener, dependencies);

  useEffect(() => {
    const handles: SubscriptionHandle[] = [];

    // Subscribe to all habit events
    const habitEventTypes: EventType[] = [
      'HABIT_CREATED',
      'HABIT_UPDATED',
      'HABIT_DELETED',
      'HABIT_COMPLETED',
      'HABIT_UNCOMPLETED',
    ];

    habitEventTypes.forEach((eventType) => {
      const wrappedListener = (payload: EventPayload) => {
        memoizedListener(eventType, payload);
      };
      handles.push(crossSliceEvents.subscribe(eventType, wrappedListener));
    });

    // Cleanup function
    return () => {
      handles.forEach((handle) => crossSliceEvents.unsubscribe(handle));
    };
  }, [memoizedListener]);
}

/**
 * Hook for analytics-related cross-slice events
 * @param listener The callback function to execute when analytics events occur
 * @param dependencies Optional dependencies array for the listener function
 */
export function useAnalyticsEvents(
  listener: (eventType: EventType, payload: EventPayload) => void,
  dependencies: React.DependencyList = [],
) {
  const memoizedListener = useCallback(listener, dependencies);

  useEffect(() => {
    const handles: SubscriptionHandle[] = [];

    // Subscribe to all analytics events
    const analyticsEventTypes: EventType[] = [
      'ANALYTICS_REFRESH_NEEDED',
      'ANALYTICS_DATA_UPDATED',
    ];

    analyticsEventTypes.forEach((eventType) => {
      const wrappedListener = (payload: EventPayload) => {
        memoizedListener(eventType, payload);
      };
      handles.push(crossSliceEvents.subscribe(eventType, wrappedListener));
    });

    // Cleanup function
    return () => {
      handles.forEach((handle) => crossSliceEvents.unsubscribe(handle));
    };
  }, [memoizedListener]);
}

/**
 * Hook that provides access to all event emitters
 * @returns Object with all event emitter functions
 */
export function useEventEmitters() {
  return {
    // Task event emitters
    emitTaskCreated: (taskId: string, userId: string, taskTitle: string) => 
      taskEvents.created(taskId, userId, taskTitle),
    emitTaskUpdated: (taskId: string, userId: string, taskTitle?: string) => 
      taskEvents.updated(taskId, userId, taskTitle),
    emitTaskDeleted: (taskId: string, userId: string, taskTitle?: string) => 
      taskEvents.deleted(taskId, userId, taskTitle),
    emitTaskStatusChanged: (taskId: string, userId: string, oldStatus: string, newStatus: string) => 
      taskEvents.statusChanged(taskId, userId, oldStatus, newStatus),
    
    // Habit event emitters
    emitHabitCreated: (payload: { habitId: string; userId: string; habitName?: string; timestamp: Date }) => 
      habitEvents.created(payload.habitId, payload.userId, payload.habitName || ''),
    emitHabitUpdated: (payload: { habitId: string; userId: string; habitName?: string; timestamp: Date }) => 
      habitEvents.updated(payload.habitId, payload.userId, payload.habitName || ''),
    emitHabitDeleted: (payload: { habitId: string; userId: string; habitName?: string; timestamp: Date }) => 
      habitEvents.deleted(payload.habitId, payload.userId, payload.habitName || ''),
    emitHabitCompleted: (payload: { habitId: string; userId: string; habitName?: string; eventDate?: string; timestamp: Date }) => 
      habitEvents.completed(payload.habitId, payload.userId, payload.habitName || '', payload.eventDate || ''),
    emitHabitUncompleted: (payload: { habitId: string; userId: string; habitName?: string; eventDate?: string; timestamp: Date }) => 
      habitEvents.uncompleted(payload.habitId, payload.userId, payload.habitName || '', payload.eventDate || ''),
    
    // Analytics event emitters
    emitAnalyticsRefreshNeeded: (payload: { userId: string; trigger: 'task_change' | 'habit_change' | 'manual' | 'real_time'; timestamp: Date }) => 
      analyticsEvents.refreshNeeded(payload.userId, payload.trigger),
    emitAnalyticsDataUpdated: (payload: { userId: string; trigger: 'task_change' | 'habit_change' | 'manual' | 'real_time'; timestamp: Date }) => 
      analyticsEvents.dataUpdated(payload.userId, payload.trigger),
    
    // Direct emit function
    emit: crossSliceEvents.emit,
  };
}

/**
 * Hook for debugging cross-slice events
 * @returns Debug information about current subscriptions
 */
export function useCrossSliceDebug() {
  const [debugInfo, setDebugInfo] = useState(crossSliceEvents.getDebugInfo());
  const [activeEventTypes, setActiveEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo(crossSliceEvents.getDebugInfo());
      setActiveEventTypes(crossSliceEvents.getActiveEventTypes());
    };

    // Update debug info every second
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    debugInfo,
    activeEventTypes,
    totalListeners: Object.values(debugInfo).reduce(
      (sum, count) => sum + count,
      0,
    ),
    clearAll: crossSliceEvents.clearAll,
  };
}

// Re-export the main event system for direct access
export { crossSliceEvents, taskEvents, habitEvents, analyticsEvents };
