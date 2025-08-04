'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { realtimeManager } from '@/utils/supabase/realtime-client';
import { realtimeToasts } from '@/lib/toast';
import type { RealtimeConnection } from '@/types/realtime';

export default function RealtimeTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnection>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Update connection status periodically
    const interval = setInterval(() => {
      setConnectionStatus(realtimeManager.getConnectionStatus());
      setActiveChannels(realtimeManager.getActiveChannels());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const testBasicConnection = async () => {
    try {
      setTestResults((prev) => [...prev, '🔌 Testing basic connection...']);

      // Test subscribing to a dummy channel
      const channel = await realtimeManager.subscribe(
        'test-connection',
        'INSERT',
        'tasks',
        (payload) => {
          setTestResults((prev) => [
            ...prev,
            `📡 Received test event: ${JSON.stringify(payload)}`,
          ]);
        },
      );

      setTestResults((prev) => [
        ...prev,
        '✅ Basic connection test successful',
      ]);
      realtimeToasts.connected();

      // Cleanup after 5 seconds
      setTimeout(async () => {
        await realtimeManager.unsubscribe('test-connection');
        setTestResults((prev) => [...prev, '🧹 Test channel cleaned up']);
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setTestResults((prev) => [
        ...prev,
        `❌ Connection test failed: ${errorMessage}`,
      ]);
      realtimeToasts.error(errorMessage);
    }
  };

  const testEnvironmentVariables = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setTestResults((prev) => [
      ...prev,
      '🔍 Checking environment variables...',
      `URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`,
      `Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`,
    ]);

    if (!supabaseUrl || !supabaseKey) {
      realtimeToasts.error('Environment variables not configured');
    } else {
      realtimeToasts.connected();
    }
  };

  const cleanupAll = async () => {
    try {
      await realtimeManager.cleanup();
      setTestResults((prev) => [...prev, '🧹 All subscriptions cleaned up']);
      realtimeToasts.connected();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setTestResults((prev) => [...prev, `❌ Cleanup failed: ${errorMessage}`]);
      realtimeToasts.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Real-Time Client Test
          </h1>
          <p className="text-slate-600">
            Test the Supabase real-time client configuration and basic
            functionality.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Connection Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-slate-700 mb-2">Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="text-sm">
                    {connectionStatus.isConnected
                      ? 'Connected'
                      : 'Disconnected'}
                  </span>
                </div>
                {connectionStatus.isConnecting && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Connecting...</span>
                  </div>
                )}
                {connectionStatus.error && (
                  <div className="text-sm text-red-600">
                    Error: {connectionStatus.error}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-700 mb-2">
                Active Channels
              </h3>
              <div className="text-sm text-slate-600">
                {activeChannels.length === 0 ? (
                  <span className="text-slate-400">No active channels</span>
                ) : (
                  <ul className="space-y-1">
                    {activeChannels.map((channel) => (
                      <li key={channel} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {channel}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Test Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testEnvironmentVariables}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test Environment Variables
            </Button>
            <Button
              onClick={testBasicConnection}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Test Basic Connection
            </Button>
            <Button
              onClick={cleanupAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cleanup All
            </Button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Test Results
          </h2>
          <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No test results yet. Run a test to see results.
              </p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Instructions
          </h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              1. <strong>Test Environment Variables:</strong> Verify that
              Supabase URL and key are configured
            </p>
            <p>
              2. <strong>Test Basic Connection:</strong> Attempt to subscribe to
              a test channel
            </p>
            <p>
              3. <strong>Monitor Results:</strong> Watch the test results and
              connection status
            </p>
            <p>
              4. <strong>Cleanup:</strong> Remove all test subscriptions when
              done
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
