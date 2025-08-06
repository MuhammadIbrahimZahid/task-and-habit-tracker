// Real-time event types for cross-slice communication
export type RealtimeEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'habit_created'
  | 'habit_updated'
  | 'habit_deleted'
  | 'habit_event_created'
  | 'habit_event_updated'
  | 'habit_event_deleted'
  | 'analytics_updated'
  | 'streak_updated'
  | 'completion_rate_updated';

// Event payload structure
export interface RealtimeEventPayload {
  type: RealtimeEventType;
  userId: string;
  data?: any;
  timestamp: number;
}

// Callback function type for event handlers
export type RealtimeCallback = (event: RealtimeEventPayload) => void;

// Connection state for real-time client
export interface RealtimeConnection {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

// Configuration for real-time client
export interface RealtimeConfig {
  enabled: boolean;
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

// Channel subscription status
export type ChannelStatus =
  | 'SUBSCRIBED'
  | 'TIMED_OUT'
  | 'CLOSED'
  | 'CHANNEL_ERROR';

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast notification payload
export interface ToastPayload {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Real-time subscription options
export interface SubscriptionOptions {
  filter?: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
}

// Event manager interface
export interface EventManager {
  subscribe: (eventType: RealtimeEventType, callback: RealtimeCallback) => void;
  unsubscribe: (
    eventType: RealtimeEventType,
    callback: RealtimeCallback,
  ) => void;
  emit: (event: RealtimeEventPayload) => void;
  cleanup: () => void;
}

// Real-time client interface
export interface RealtimeClient {
  subscribe: <T = any>(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    callback: (payload: any) => void,
    options?: SubscriptionOptions,
  ) => any;
  unsubscribe: (channelName: string) => void;
  unsubscribeAll: () => void;
  getConnectionState: () => RealtimeConnection;
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
}
