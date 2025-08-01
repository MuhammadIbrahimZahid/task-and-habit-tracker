'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Award,
  Activity,
} from 'lucide-react';
import type { AnalyticsSummary } from '@/types/analytics';

interface AnalyticsSummaryProps {
  data: AnalyticsSummary;
  isLoading?: boolean;
}

export function AnalyticsSummary({
  data,
  isLoading = false,
}: AnalyticsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Habits',
      value: data.total_habits,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All habits created',
    },
    {
      title: 'Active Habits',
      value: data.active_habits,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Currently tracking',
    },
    {
      title: 'Avg Completion Rate',
      value: `${data.average_completion_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'This month',
    },
    {
      title: 'Current Streaks',
      value: data.total_current_streaks,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Total active streaks',
    },
    {
      title: 'Longest Streak',
      value: data.longest_overall_streak,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Best ever streak',
    },
    {
      title: 'Most Consistent',
      value: data.most_consistent_habit_name || 'None',
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: data.most_consistent_habit_rate
        ? `${data.most_consistent_habit_rate.toFixed(1)}% completion`
        : 'No data yet',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>

              {/* Special badge for completion rate */}
              {metric.title === 'Avg Completion Rate' && (
                <div className="mt-2">
                  <Badge
                    variant={
                      data.average_completion_rate >= 80
                        ? 'default'
                        : data.average_completion_rate >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {data.average_completion_rate >= 80
                      ? 'Excellent'
                      : data.average_completion_rate >= 60
                        ? 'Good'
                        : data.average_completion_rate >= 40
                          ? 'Fair'
                          : 'Needs Focus'}
                  </Badge>
                </div>
              )}

              {/* Special badge for longest streak */}
              {metric.title === 'Longest Streak' &&
                data.longest_overall_streak > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {data.longest_overall_streak >= 30
                        ? '🔥 Amazing!'
                        : data.longest_overall_streak >= 14
                          ? '🌟 Great!'
                          : data.longest_overall_streak >= 7
                            ? '👍 Good!'
                            : 'Keep going!'}
                    </Badge>
                  </div>
                )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
