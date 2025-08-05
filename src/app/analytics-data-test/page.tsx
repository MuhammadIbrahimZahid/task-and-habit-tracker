'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { AnalyticsSummary } from '@/types/analytics';
import type { StreakData } from '@/types/analytics';

interface StreaksResponse {
  streaks: StreakData[];
  total_habits: number;
  total_current_streaks: number;
  longest_overall_streak: number;
}

export default function AnalyticsDataTestPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [streaks, setStreaks] = useState<StreaksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching analytics data...');

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

      setSummary(summaryData);
      setStreaks(streaksData);
      setLastFetch(new Date());
      console.log('✅ Analytics data fetched successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching analytics data:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analytics Data Test</h1>
        <p className="text-muted-foreground">
          Test the analytics data fetching functions before proceeding with Step 5.1.2
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching...' : 'Refresh Data'}
        </Button>

        {lastFetch && (
          <span className="text-sm text-muted-foreground">
            Last updated: {lastFetch.toLocaleTimeString()}
          </span>
        )}
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

      {/* Analytics Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analytics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.total_habits}</div>
                <div className="text-sm text-muted-foreground">Total Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.active_habits}</div>
                <div className="text-sm text-muted-foreground">Active Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {summary.average_completion_rate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Completion Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {summary.total_current_streaks}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Current Streaks
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Longest Overall Streak:</span>
                <Badge variant="secondary">{summary.longest_overall_streak} days</Badge>
              </div>
              {summary.most_consistent_habit_name && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Most Consistent Habit:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {summary.most_consistent_habit_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summary.most_consistent_habit_rate}% completion rate
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaks Data */}
      {streaks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Streaks Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{streaks.total_habits}</div>
                <div className="text-sm text-muted-foreground">Total Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{streaks.total_current_streaks}</div>
                <div className="text-sm text-muted-foreground">
                  Total Current Streaks
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{streaks.longest_overall_streak}</div>
                <div className="text-sm text-muted-foreground">
                  Longest Overall Streak
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{streaks.streaks.length}</div>
                <div className="text-sm text-muted-foreground">
                  Habits with Data
                </div>
              </div>
            </div>

            {streaks.streaks.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium">Individual Habit Streaks:</h4>
                {streaks.streaks.map((streak) => (
                  <div
                    key={streak.habit_id}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="font-medium">{streak.habit_name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Current: {streak.current_streak}
                      </Badge>
                      <Badge variant="outline">
                        Longest: {streak.longest_streak}
                      </Badge>
                      <Badge variant="outline">
                        Total: {streak.total_completions}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No streak data available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Verify that analytics summary data loads correctly</li>
          <li>2. Verify that streaks data loads correctly</li>
          <li>3. Check that the data makes sense for your current habits</li>
          <li>4. Test the refresh functionality</li>
          <li>5. Verify no errors in the console</li>
        </ol>
      </div>
    </div>
  );
} 