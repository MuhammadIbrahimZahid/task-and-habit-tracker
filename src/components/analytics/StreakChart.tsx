'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
import type { StreakData } from '@/types/analytics';
import {
  CHART_PRESETS,
  CHART_STYLES,
  TOOLTIP_STYLES,
  formatChartValue,
} from '@/lib/chart-utils';

interface StreakChartProps {
  data: StreakData[];
  isLoading?: boolean;
}

export function StreakChart({ data, isLoading = false }: StreakChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading streaks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No streak data available</p>
              <p className="text-sm">
                Complete some habits to see your streaks!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = data.map((streak) => ({
    name: streak.habit_name,
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    color: CHART_PRESETS.streakChart.colors.current,
  }));

  // Find the highest streak for scaling
  const maxStreak = Math.max(
    ...data.map((s) => Math.max(s.current_streak, s.longest_streak)),
    1,
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData = payload[0].payload;
      const streakData = data.find((s: StreakData) => s.habit_name === label);

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                Current: {chartData.currentStreak} days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">
                Longest: {chartData.longestStreak} days
              </span>
            </div>
            {streakData && (
              <div className="text-xs text-muted-foreground mt-1">
                Total completions: {streakData.total_completions}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Current Streaks
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Longest</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right:
                  typeof window !== 'undefined' && window.innerWidth < 768
                    ? 10
                    : 30,
                left:
                  typeof window !== 'undefined' && window.innerWidth < 768
                    ? 10
                    : 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                opacity={CHART_STYLES.grid.opacity}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: CHART_STYLES.axis.fontSize }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tickFormatter={(value) => {
                  // Truncate long habit names for mobile
                  if (
                    typeof window !== 'undefined' &&
                    window.innerWidth < 768
                  ) {
                    return value.length > 8
                      ? value.substring(0, 8) + '...'
                      : value;
                  }
                  return value;
                }}
              />
              <YAxis
                domain={[0, maxStreak]}
                tick={{ fontSize: CHART_STYLES.axis.fontSize }}
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="currentStreak"
                fill={CHART_PRESETS.streakChart.colors.current}
                radius={CHART_STYLES.bar.radius}
              />
              <Bar
                dataKey="longestStreak"
                fill={CHART_PRESETS.streakChart.colors.longest}
                radius={CHART_STYLES.bar.radius}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...data.map((s) => s.current_streak), 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Best Current Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...data.map((s) => s.longest_streak), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Longest Ever</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
