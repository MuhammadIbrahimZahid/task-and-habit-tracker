'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { subscribeToAnalytics } from '@/lib/realtime-subscriptions';
import type { SubscriptionHandle } from '@/lib/realtime-subscriptions';
import { Wifi, WifiOff, Play, Square } from 'lucide-react';

export default function AnalyticsSubscriptionTestPage() {
  const [userId, setUserId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionHandle[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user ID from session
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  const handleStartSubscription = async () => {
    if (!userId) {
      alert('No user ID available');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔌 Starting analytics subscription test...');

      const newSubscriptions = await subscribeToAnalytics(
        userId,
        (payload) => {
          const eventInfo = `📊 ${payload.table} ${payload.eventType}: ${(payload.new as any)?.id || (payload.old as any)?.id}`;
          console.log(eventInfo);
          setEvents((prev) => [eventInfo, ...prev.slice(0, 9)]); // Keep last 10 events
        },
        (error) => {
          console.error('❌ Analytics subscription error:', error);
          const errorInfo = `❌ Error: ${error.message}`;
          setEvents((prev) => [errorInfo, ...prev.slice(0, 9)]);
        },
      );

      setSubscriptions(newSubscriptions);
      setIsConnected(true);
      console.log('✅ Analytics subscription test started');
    } catch (error) {
      console.error('❌ Failed to start analytics subscription:', error);
      alert(
        'Failed to start subscription: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSubscription = async () => {
    setIsLoading(true);
    try {
      console.log('🧹 Stopping analytics subscription test...');

      for (const subscription of subscriptions) {
        await subscription.unsubscribe();
      }

      setSubscriptions([]);
      setIsConnected(false);
      console.log('✅ Analytics subscription test stopped');
    } catch (error) {
      console.error('❌ Error stopping subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analytics Subscription Test</h1>
        <p className="text-muted-foreground">
          Test the analytics subscription function before proceeding with Step
          5.1
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">User ID:</span>
          <span className="text-sm text-muted-foreground">
            {userId ? userId.slice(0, 8) + '...' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleStartSubscription}
          disabled={isLoading || isConnected || !userId}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Subscription
        </Button>

        <Button
          onClick={handleStopSubscription}
          disabled={isLoading || !isConnected}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Stop Subscription
        </Button>

        <Button onClick={clearEvents} variant="outline" size="sm">
          Clear Events
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>
            1. Click "Start Subscription" to begin listening for analytics
            events
          </li>
          <li>2. Open another tab and create/update/delete tasks or habits</li>
          <li>3. Watch for real-time events appearing below</li>
          <li>4. Verify that events are logged correctly</li>
          <li>5. Click "Stop Subscription" to clean up</li>
        </ol>
      </div>

      {/* Events Log */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Real-time Events Log:</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events yet. Start the subscription and make changes in another
              tab.
            </p>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="text-sm font-mono bg-white p-2 rounded border"
              >
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subscription Info */}
      {subscriptions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            Active Subscriptions:
          </h3>
          <div className="space-y-1">
            {subscriptions.map((sub, index) => (
              <div key={index} className="text-sm text-green-700">
                • {sub.channelName} - {sub.isActive() ? 'Active' : 'Inactive'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
