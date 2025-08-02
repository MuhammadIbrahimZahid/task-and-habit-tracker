'use client';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Award,
  RefreshCw,
  Download,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsSummaryData {
  total_habits: number;
  active_habits: number;
  average_completion_rate: number;
  total_current_streaks: number;
  longest_overall_streak: number;
  most_consistent_habit_name: string | null;
}

interface ModernAnalyticsDashboardProps {
  summaryData: AnalyticsSummaryData | null;
  selectedPeriod: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
  onRefresh: () => void;
  onExport: () => void;
  analyticsLoading: boolean;
  analyticsError: string | null;
  streaksData: any[];
  completionData: any[];
}

export default function ModernAnalyticsDashboard({
  summaryData,
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  onExport,
  analyticsLoading,
  analyticsError,
  streaksData,
  completionData,
}: ModernAnalyticsDashboardProps) {
  const metrics = [
    {
      title: 'Total Habits',
      value: summaryData?.total_habits || 0,
      subtitle: 'Habits created',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Active Habits',
      value: summaryData?.active_habits || 0,
      subtitle: 'Currently tracking',
      icon: Activity,
      color: 'text-green-600',
    },
    {
      title: 'Completion Rate',
      value: `${summaryData?.average_completion_rate?.toFixed(1) || '0'}%`,
      subtitle: 'Average performance',
      icon: CheckCircle2,
      color: 'text-purple-600',
    },
    {
      title: 'Current Streaks',
      value: summaryData?.total_current_streaks || 0,
      subtitle: 'Active streaks',
      icon: Zap,
      color: 'text-orange-600',
    },
    {
      title: 'Best Streak',
      value: summaryData?.longest_overall_streak || 0,
      subtitle: 'Personal record',
      icon: Award,
      color: 'text-yellow-600',
    },
    {
      title: 'Most Consistent',
      value: summaryData?.most_consistent_habit_name || 'None',
      subtitle: 'Top performing habit',
      icon: BarChart3,
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Track your progress and performance insights
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              onClick={onRefresh}
              disabled={analyticsLoading}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-transparent"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={onExport}
              disabled={analyticsLoading}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {analyticsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">
                  Error Loading Analytics
                </h3>
                <p className="text-red-600">{analyticsError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card
            key={metric.title}
            className="bg-white shadow-lg border border-slate-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">
                    {metric.title}
                  </p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-slate-900">
                      {analyticsLoading ? (
                        <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                      ) : (
                        metric.value
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{metric.subtitle}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-slate-100 ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Streaks Chart */}
        <Card className="bg-white shadow-lg border border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Current Streaks</CardTitle>
              </div>
              <div className="text-sm text-slate-500">
                {streaksData.length} habits
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 flex-1 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : streaksData.length > 0 ? (
              <div className="space-y-4">
                {streaksData.slice(0, 5).map((streak, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="font-medium text-slate-700">
                        {streak.habit_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-orange-600">
                        {streak.current_streak}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No streak data available
                </h3>
                <p className="text-slate-500">
                  Complete some habits to see your streaks!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Rates Chart */}
        <Card className="bg-white shadow-lg border border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Completion Rates</CardTitle>
              </div>
              <div className="text-sm text-slate-500">
                {selectedPeriod === 'week'
                  ? 'This Week'
                  : selectedPeriod === 'month'
                    ? 'This Month'
                    : 'This Year'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="h-2 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : completionData.length > 0 ? (
              <div className="space-y-4">
                {completionData.slice(0, 5).map((completion, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {completion.habit_name}
                      </span>
                      <span className="font-bold text-purple-600">
                        {completion.completion_rate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completion.completion_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No completion data available
                </h3>
                <p className="text-slate-500">
                  Track some habits to see your completion rates!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
