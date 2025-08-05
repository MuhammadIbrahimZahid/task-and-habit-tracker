'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StreakChart } from '@/components/analytics/StreakChart';
import { CompletionRateChart } from '@/components/analytics/CompletionRateChart';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { useRealtimeAnalytics } from '@/hooks/use-realtime-analytics';
import type {
  StreakData,
  CompletionRateData,
  AnalyticsSummary as AnalyticsSummaryType,
} from '@/types/analytics';
import { BarChart3, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function AnalyticsTestPage() {
  const [streaksData, setStreaksData] = useState<StreakData[]>([]);
  const [completionData, setCompletionData] = useState<CompletionRateData[]>(
    [],
  );
  const [summaryData, setSummaryData] = useState<AnalyticsSummaryType | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

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

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [streaksResponse, completionResponse, summaryResponse] =
        await Promise.all([
          fetch('/api/analytics/streaks'),
          fetch(`/api/analytics/completion-rates?period=${selectedPeriod}`),
          fetch('/api/analytics/summary'),
        ]);

      if (
        !streaksResponse.ok ||
        !completionResponse.ok ||
        !summaryResponse.ok
      ) {
        throw new Error('Failed to fetch analytics data');
      }

      const [streaksResult, completionResult, summaryResult] =
        await Promise.all([
          streaksResponse.json(),
          completionResponse.json(),
          summaryResponse.json(),
        ]);

      setStreaksData(streaksResult.streaks || []);
      setCompletionData(completionResult.completionRates || []);
      setSummaryData(summaryResult);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time analytics hook
  const { isConnected, refreshAnalytics } = useRealtimeAnalytics({
    userId,
    onDataChange: fetchAnalyticsData,
    enabled: !!userId,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const handleRefresh = () => {
    refreshAnalytics();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Analytics Test Page</h2>
          <p className="text-muted-foreground mb-4">
            Test your analytics components
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Real-time:</span>
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-destructive">Error: {error}</p>
          </div>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Test Page</h1>
          <p className="text-muted-foreground">
            Testing analytics components with real data from your API endpoints
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedPeriod}
            onValueChange={(value: 'week' | 'month' | 'year') =>
              setSelectedPeriod(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Analytics Summary</h2>
        <AnalyticsSummary
          data={
            summaryData || {
              total_habits: 0,
              active_habits: 0,
              average_completion_rate: 0,
              total_current_streaks: 0,
              longest_overall_streak: 0,
              most_consistent_habit_id: null,
              most_consistent_habit_name: null,
              most_consistent_habit_rate: null,
            }
          }
          isLoading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Streak Analysis</h2>
          <StreakChart data={streaksData} isLoading={isLoading} />
        </div>

        {/* Completion Rate Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Completion Rates</h2>
          <CompletionRateChart data={completionData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
