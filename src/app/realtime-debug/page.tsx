'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RealtimeDebugPage() {
  const [events, setEvents] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const addEvent = (message: string) => {
    setEvents((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        addEvent(`✅ Authenticated as: ${session.user.email}`);
      } else {
        addEvent('❌ Not authenticated');
      }
    };
    getSession();
  }, []);

  const testBasicRealtime = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user');
      return;
    }

    const supabase = createClient();

    try {
      addEvent('🔌 Testing basic real-time subscription...');

      // Create a simple channel subscription
      const channel = supabase
        .channel('test-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('📡 Basic real-time event received:', payload);
            addEvent(`📡 INSERT event: ${JSON.stringify(payload.new)}`);
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('📡 Basic real-time UPDATE event received:', payload);
            addEvent(`📡 UPDATE event: ${JSON.stringify(payload.new)}`);
          },
        )
        .subscribe((status) => {
          console.log('📡 Basic channel status:', status);
          addEvent(`📡 Channel status: ${status}`);
          setIsConnected(status === 'SUBSCRIBED');
        });

      addEvent('✅ Basic real-time subscription created');
    } catch (error) {
      addEvent(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const testDatabaseOperation = async () => {
    if (!userId) {
      addEvent('❌ No authenticated user');
      return;
    }

    try {
      addEvent('🧪 Creating test task...');

      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: userId,
            title: `Debug Task ${Date.now()}`,
            description: 'Testing basic real-time',
            status: 'pending',
            priority: 'medium',
          },
        ])
        .select()
        .single();

      if (error) {
        addEvent(`❌ Error creating task: ${error.message}`);
      } else {
        addEvent(`✅ Task created: ${data.title}`);

        // Delete after 3 seconds
        setTimeout(async () => {
          try {
            addEvent('🗑️ Deleting test task...');
            const { error: deleteError } = await supabase
              .from('tasks')
              .update({ deleted_at: new Date() })
              .eq('id', data.id);

            if (deleteError) {
              addEvent(`❌ Error deleting task: ${deleteError.message}`);
            } else {
              addEvent('✅ Task deleted');
            }
          } catch (error) {
            addEvent(
              `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }, 3000);
      }
    } catch (error) {
      addEvent(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🔍 Real-time Debug Page
          </h1>
          <p className="text-slate-600">
            Testing basic Supabase real-time functionality
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={testBasicRealtime}
                disabled={!userId}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Test Basic Real-time
              </Button>
              <Button
                onClick={testDatabaseOperation}
                disabled={!userId || !isConnected}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Test DB Operation
              </Button>
              <Button onClick={clearEvents} variant="outline">
                Clear Events
              </Button>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              <div>User ID: {userId || 'Not authenticated'}</div>
              <div>
                Connection: {isConnected ? '✅ Connected' : '❌ Disconnected'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Event Log ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-slate-500">No events yet...</div>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="mb-1">
                    {event}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
