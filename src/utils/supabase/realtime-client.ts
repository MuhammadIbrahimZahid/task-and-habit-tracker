import { createBrowserClient } from '@supabase/ssr';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import type {
  RealtimeConfig,
  RealtimeConnection,
  ChannelStatus,
} from '@/types/realtime';

/**
 * Real-time client configuration for Supabase
 * Extends the existing client with real-time capabilities
 */

// Real-time configuration constants
const REALTIME_CONFIG: RealtimeConfig = {
  enabled: true,
  autoReconnect: true,
  reconnectInterval: 1000, // 1 second
  maxReconnectAttempts: 5,
};

/**
 * Create a Supabase client with real-time capabilities
 */
export function createRealtimeClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  );
}

/**
 * Real-time connection manager
 */
class RealtimeConnectionManager {
  private client = createRealtimeClient();
  private channels = new Map<string, RealtimeChannel>();
  private connectionStatus: RealtimeConnection = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  };

  /**
   * Get the current connection status
   */
  getConnectionStatus(): RealtimeConnection {
    return this.connectionStatus;
  }

  /**
   * Subscribe to a channel with proper error handling
   */
  async subscribe(
    channelName: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL',
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string,
  ): Promise<RealtimeChannel> {
    try {
      console.log(
        `🔌 Subscribing to ${channelName} for ${table} ${event} events`,
      );

      // Create channel subscription
      const channel = this.client.channel(channelName);

      // Handle different event types
      if (event === 'ALL') {
        // Subscribe to all events separately
        channel
          .on(
            'postgres_changes' as any,
            {
              event: 'INSERT',
              schema: 'public',
              table,
              filter,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log(`📡 Received INSERT event for ${table}:`, payload);
              callback(payload);
            },
          )
          .on(
            'postgres_changes' as any,
            {
              event: 'UPDATE',
              schema: 'public',
              table,
              filter,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log(`📡 Received UPDATE event for ${table}:`, payload);
              callback(payload);
            },
          )
          .on(
            'postgres_changes' as any,
            {
              event: 'DELETE',
              schema: 'public',
              table,
              filter,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log(`📡 Received DELETE event for ${table}:`, payload);
              callback(payload);
            },
          );
      } else {
        // Subscribe to specific event
        channel.on(
          'postgres_changes' as any,
          {
            event,
            schema: 'public',
            table,
            filter,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log(`📡 Received ${event} event for ${table}:`, payload);
            callback(payload);
          },
        );
      }

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`📡 Channel ${channelName} status:`, status);
        this.handleChannelStatus(channelName, status);
      });

      // Store channel reference
      this.channels.set(channelName, channel);

      return channel;
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        console.log(`🔌 Unsubscribing from ${channelName}`);
        await this.client.removeChannel(channel);
        this.channels.delete(channelName);
      }
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Handle channel status changes
   */
  private handleChannelStatus(channelName: string, status: string) {
    switch (status) {
      case 'SUBSCRIBED':
        // Only update connection status if we have active channels
        if (this.channels.size > 0) {
          this.connectionStatus = {
            isConnected: true,
            isConnecting: false,
            error: null,
            reconnectAttempts: 0,
          };
        }
        console.log(`✅ Channel ${channelName} connected successfully`);
        break;
      case 'CHANNEL_ERROR':
        // Only mark as disconnected if this was the last channel
        if (this.channels.size <= 1) {
          this.connectionStatus = {
            isConnected: false,
            isConnecting: false,
            error: `Channel ${channelName} error`,
            reconnectAttempts: this.connectionStatus.reconnectAttempts,
          };
        }
        console.error(`❌ Channel ${channelName} error`);
        break;
      case 'TIMED_OUT':
        // Only mark as disconnected if this was the last channel
        if (this.channels.size <= 1) {
          this.connectionStatus = {
            isConnected: false,
            isConnecting: false,
            error: `Channel ${channelName} timed out`,
            reconnectAttempts: this.connectionStatus.reconnectAttempts,
          };
        }
        console.warn(`⏰ Channel ${channelName} timed out`);
        break;
      case 'CLOSED':
        // Only mark as disconnected if this was the last channel
        if (this.channels.size <= 1) {
          this.connectionStatus = {
            isConnected: false,
            isConnecting: false,
            error: null,
            reconnectAttempts: this.connectionStatus.reconnectAttempts,
          };
        }
        console.log(`🔌 Channel ${channelName} closed`);
        break;
      default:
        console.log(`📡 Channel ${channelName} status: ${status}`);
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up all real-time subscriptions');
    const unsubscribePromises = Array.from(this.channels.keys()).map(
      (channelName) => this.unsubscribe(channelName),
    );
    await Promise.all(unsubscribePromises);
    this.channels.clear();
    this.connectionStatus = {
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    };
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeConnectionManager();

// Export the client for direct use if needed
export const supabaseRealtimeClient = createRealtimeClient();
