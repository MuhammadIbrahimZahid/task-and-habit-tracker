import { toast } from 'sonner';
import type { ToastType, ToastPayload } from '@/types/realtime';

/**
 * Toast utility functions for consistent notifications across the app
 */

// Default toast durations
const TOAST_DURATIONS = {
  success: 4000,
  error: 6000,
  info: 4000,
  warning: 5000,
} as const;

/**
 * Show a success toast notification
 */
export function showSuccess(
  title: string,
  description?: string,
  duration?: number,
) {
  toast.success(title, {
    description,
    duration: duration ?? TOAST_DURATIONS.success,
  });
}

/**
 * Show an error toast notification
 */
export function showError(
  title: string,
  description?: string,
  duration?: number,
) {
  toast.error(title, {
    description,
    duration: duration ?? TOAST_DURATIONS.error,
  });
}

/**
 * Show an info toast notification
 */
export function showInfo(
  title: string,
  description?: string,
  duration?: number,
) {
  toast.info(title, {
    description,
    duration: duration ?? TOAST_DURATIONS.info,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarning(
  title: string,
  description?: string,
  duration?: number,
) {
  toast.warning(title, {
    description,
    duration: duration ?? TOAST_DURATIONS.warning,
  });
}

/**
 * Show a toast notification with custom type
 */
export function showToast(payload: ToastPayload) {
  const { type, title, description, duration } = payload;

  switch (type) {
    case 'success':
      showSuccess(title, description, duration);
      break;
    case 'error':
      showError(title, description, duration);
      break;
    case 'info':
      showInfo(title, description, duration);
      break;
    case 'warning':
      showWarning(title, description, duration);
      break;
    default:
      showInfo(title, description, duration);
  }
}

/**
 * Task-specific toast notifications
 */
export const taskToasts = {
  created: (taskTitle: string) =>
    showSuccess(
      'Task Created!',
      `"${taskTitle}" has been added to your tasks.`,
    ),

  updated: (taskTitle: string) =>
    showInfo('Task Updated!', `"${taskTitle}" has been modified.`),

  deleted: (taskTitle: string) =>
    showInfo('Task Deleted!', `"${taskTitle}" has been removed.`),

  statusChanged: (taskTitle: string, newStatus: string) =>
    showInfo('Status Updated!', `"${taskTitle}" is now ${newStatus}.`),

  error: (action: string, error?: string) =>
    showError(`Failed to ${action} task`, error || 'Please try again.'),
};

/**
 * Habit-specific toast notifications
 */
export const habitToasts = {
  created: (habitName: string) =>
    showSuccess(
      'Habit Created!',
      `"${habitName}" has been added to your habits.`,
    ),

  updated: (habitName: string) =>
    showInfo('Habit Updated!', `"${habitName}" has been modified.`),

  deleted: (habitName: string) =>
    showInfo('Habit Deleted!', `"${habitName}" has been removed.`),

  completed: (habitName: string, date: string) =>
    showSuccess('Progress Recorded!', `"${habitName}" completed for ${date}.`),

  uncompleted: (habitName: string, date: string) =>
    showInfo(
      'Progress Updated!',
      `"${habitName}" marked as incomplete for ${date}.`,
    ),

  error: (action: string, error?: string) =>
    showError(`Failed to ${action} habit`, error || 'Please try again.'),
};

/**
 * Analytics-specific toast notifications
 */
export const analyticsToasts = {
  refreshed: () =>
    showInfo('Analytics Updated!', 'Your progress data has been refreshed.'),

  exported: (type: string) =>
    showSuccess('Export Complete!', `Your ${type} data has been exported.`),

  error: (action: string, error?: string) =>
    showError(`Failed to ${action} analytics`, error || 'Please try again.'),
};

/**
 * Real-time connection toasts
 */
export const realtimeToasts = {
  connected: () =>
    showSuccess('Real-time Connected!', 'Live updates are now active.'),

  disconnected: () =>
    showWarning(
      'Connection Lost',
      'Real-time updates are temporarily unavailable.',
    ),

  reconnected: () =>
    showSuccess('Reconnected!', 'Live updates have been restored.'),

  error: (error?: string) =>
    showError('Connection Error', error || 'Real-time connection failed.'),
};
