'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff, Play, Square, Zap, Target, TrendingUp, Trophy, Calendar, Award, Activity } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/use-realtime-analytics';
import ModernAnalyticsDashboard from '@/components/analytics/ModernAnalyticsDashboard';
import type { AnalyticsSummary } from '@/types/analytics';
import type { StreakData, CompletionRateData } from '@/types/analytics';

interface StreaksResponse {
  streaks: StreakData[];
  total_habits: number;
  total_current_streaks: number;
  longest_overall_streak: number;
}

interface CompletionResponse {
  completionRates: CompletionRateData[];
}

export default function AnalyticsRealtimeTestPage() {
  const [userId, setUserId] = useState<string>('');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [completionData, setCompletionData] = useState<CompletionRateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [testResults, setTestResults] = useState<string[]>([]);

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

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`${timestamp}: ${result}`, ...prev.slice(0, 19)]); // Keep last 20
  };

  const fetchAnalyticsData = async (trigger: string = 'manual') => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📊 Fetching analytics data (trigger: ${trigger})...`);
      addTestResult(`Fetching analytics data (${trigger})`);

      // Fetch analytics summary
      const summaryResponse = await fetch('/api/analytics/summary');
      if (!summaryResponse.ok) {
        throw new Error(`Summary API error: ${summaryResponse.status}`);
      }
      const summaryData: AnalyticsSummary = await summaryResponse.json();
      console.log('📊 Analytics summary:', summaryData);

      // Fetch streaks data
      const streaksResponse = await fetch('/api/analytics/streaks');
      if (!streaksResponse.ok) {
        throw new Error(`Streaks API error: ${streaksResponse.status}`);
      }
      const streaksData: StreaksResponse = await streaksResponse.json();
      console.log('📊 Streaks data:', streaksData);

      // Fetch completion data
      const completionResponse = await fetch(`/api/analytics/completion-rates?period=${selectedPeriod}`);
      if (!completionResponse.ok) {
        throw new Error(`Completion API error: ${completionResponse.status}`);
      }
      const completionData: CompletionResponse = await completionResponse.json();
      console.log('📊 Completion data:', completionData);

      setSummary(summaryData);
      setStreaks(streaksData.streaks || []);
      setCompletionData(completionData.completionRates || []);
      setLastFetch(new Date());
      setRefreshCount(prev => prev + 1);
      
      addTestResult(`✅ Analytics data updated successfully`);
      console.log('✅ Analytics data fetched successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching analytics data:', errorMessage);
      setError(errorMessage);
      addTestResult(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time analytics hook
  const { isConnected, refreshAnalytics } = useRealtimeAnalytics({
    userId,
    onDataChange: () => {
      addTestResult('🔄 Real-time event detected - triggering analytics refresh');
      fetchAnalyticsData('real-time');
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (userId) {
      fetchAnalyticsData('initial');
      addTestResult('🚀 Test page initialized');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAnalyticsData('period-change');
    }
  }, [selectedPeriod]);

  const handleManualRefresh = () => {
    addTestResult('🔄 Manual refresh triggered');
    refreshAnalytics();
  };

  const handleDirectRefresh = () => {
    addTestResult('🔄 Direct API refresh triggered');
    fetchAnalyticsData('direct');
  };

  const handleRapidRefresh = async () => {
    addTestResult('⚡ Rapid refresh test started');
    console.log('⚡ Testing rapid refresh...');
    for (let i = 0; i < 3; i++) {
      await fetchAnalyticsData(`rapid-${i + 1}`);
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    }
    addTestResult('⚡ Rapid refresh test completed');
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const runComprehensiveTest = async () => {
    addTestResult('🧪 Starting comprehensive real-time test...');
    
    // Test 1: Manual refresh
    addTestResult('📋 Test 1: Manual refresh');
    handleManualRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Direct refresh
    addTestResult('📋 Test 2: Direct API refresh');
    handleDirectRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Rapid refresh
    addTestResult('📋 Test 3: Rapid refresh test');
    await handleRapidRefresh();
    
    addTestResult('✅ Comprehensive test completed');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analytics Real-Time Integration Test</h1>
        <p className="text-muted-foreground">
          Comprehensive test of real-time analytics integration
        </p>
      </div>

      {/* Status and Controls */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Real-time:</span>
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
          <span className="text-sm font-medium">Refresh Count:</span>
          <Badge variant="outline">{refreshCount}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">User ID:</span>
          <span className="text-sm text-muted-foreground">
            {userId ? userId.slice(0, 8) + '...' : 'Loading...'}
          </span>
        </div>

        {lastFetch && (
          <span className="text-sm text-muted-foreground">
            Last updated: {lastFetch.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Test Controls */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button
          onClick={runComprehensiveTest}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Run Comprehensive Test
        </Button>

        <Button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Manual Refresh
        </Button>

        <Button
          onClick={handleDirectRefresh}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Direct Refresh
        </Button>

        <Button
          onClick={handleRapidRefresh}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Rapid Refresh Test
        </Button>

        <Button
          onClick={clearTestResults}
          variant="outline"
          size="sm"
        >
          Clear Results
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-slate-600">Real-time Analytics Dashboard:</span>
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Live Updates Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Manual Refresh Only</span>
            </div>
          )}
        </div>
        
        <ModernAnalyticsDashboard
          summaryData={summary}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={handleManualRefresh}
          onExport={() => {
            addTestResult('📊 Export function called');
          }}
          analyticsLoading={isLoading}
          analyticsError={error}
          streaksData={streaks}
          completionData={completionData}
        />
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Test Results & Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No test results yet.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-mono">{result}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Comprehensive Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. <strong>Initial Load:</strong> Verify analytics dashboard loads correctly</li>
          <li>2. <strong>Real-time Connection:</strong> Check that real-time status shows "Connected"</li>
          <li>3. <strong>Manual Refresh:</strong> Test manual refresh button functionality</li>
          <li>4. <strong>Direct Refresh:</strong> Test direct API calls</li>
          <li>5. <strong>Rapid Refresh:</strong> Test multiple rapid refreshes</li>
          <li>6. <strong>Real-time Triggers:</strong> Make changes in another tab and watch for automatic updates</li>
          <li>7. <strong>Period Changes:</strong> Test period selector (week/month/year)</li>
          <li>8. <strong>UI Updates:</strong> Verify charts and metrics update in real-time</li>
          <li>9. <strong>Error Handling:</strong> Check error states and recovery</li>
          <li>10. <strong>Performance:</strong> Ensure smooth updates without delays</li>
        </ol>
      </div>

      {/* Real-time Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">Real-time Status:</h3>
        <div className="space-y-1 text-sm text-green-700">
          <div>• Connection: {isConnected ? 'Active' : 'Inactive'}</div>
          <div>• User ID: {userId ? 'Loaded' : 'Loading...'}</div>
          <div>• Refresh Count: {refreshCount}</div>
          <div>• Last Update: {lastFetch ? lastFetch.toLocaleTimeString() : 'Never'}</div>
          <div>• Test Results: {testResults.length} entries</div>
          <div>• Period: {selectedPeriod}</div>
        </div>
      </div>
    </div>
  );
} 