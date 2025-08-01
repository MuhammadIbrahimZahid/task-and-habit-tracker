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
import { Target, TrendingUp } from 'lucide-react';
import type { CompletionRateData } from '@/types/analytics';
import {
  CHART_PRESETS,
  CHART_STYLES,
  getCompletionRateColor,
  formatChartValue,
} from '@/lib/chart-utils';

interface CompletionRateChartProps {
  data: CompletionRateData[];
  isLoading?: boolean;
}

export function CompletionRateChart({
  data,
  isLoading = false,
}: CompletionRateChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">
              Loading completion rates...
            </div>
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
            <Target className="h-5 w-5" />
            Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No completion data available</p>
              <p className="text-sm">
                Track some habits to see your completion rates!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart (horizontal bar chart)
  const chartData = data.map((rate) => ({
    name: rate.habit_name,
    completionRate: rate.completion_rate,
    completedDays: rate.completed_days,
    totalDays: rate.total_days,
    color: getCompletionRateColor(rate.completion_rate),
  }));

  // Sort by completion rate (highest first)
  chartData.sort((a, b) => b.completionRate - a.completionRate);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {data.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {data.completedDays} of {data.totalDays} days completed
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  const period = data[0]?.period || 'month';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Completion Rates
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {getPeriodLabel(period)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>80%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>60-79%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>40-59%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>&lt;40%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={CHART_PRESETS.completionRateChart.margins}
            >
              <CartesianGrid
                strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                opacity={CHART_STYLES.grid.opacity}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: CHART_STYLES.axis.fontSize }}
                label={{
                  value: 'Completion Rate (%)',
                  position: 'insideBottom',
                  offset: -10,
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: CHART_STYLES.axis.fontSize }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completionRate" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Habits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.filter((r) => r.completion_rate >= 80).length}
            </div>
            <div className="text-sm text-muted-foreground">On Track (80%+)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.filter((r) => r.completion_rate < 60).length}
            </div>
            <div className="text-sm text-muted-foreground">Need Focus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
