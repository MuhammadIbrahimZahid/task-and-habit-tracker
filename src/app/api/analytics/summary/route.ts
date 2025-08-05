import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { AnalyticsSummary } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analytics summary using the SQL function
    const { data: summaryResult, error: summaryError } = await supabase.rpc(
      'get_analytics_summary',
      { user_id: user.id },
    );

    if (summaryError) {
      console.error('Error getting analytics summary:', summaryError);
      return NextResponse.json(
        { error: 'Failed to get analytics summary' },
        { status: 500 },
      );
    }

    // Get task counts directly from the database
    const { data: taskCounts, error: taskError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (taskError) {
      console.error('Error getting task counts:', taskError);
      return NextResponse.json(
        { error: 'Failed to get task counts' },
        { status: 500 },
      );
    }

    const totalTasks = taskCounts?.length || 0;
    const activeTasks = taskCounts?.filter(task => task.status === 'pending').length || 0;

    if (!summaryResult || summaryResult.length === 0) {
      // Return empty summary if no data
      const emptySummary: AnalyticsSummary = {
        total_habits: 0,
        active_habits: 0,
        total_tasks: totalTasks,
        active_tasks: activeTasks,
        average_completion_rate: 0,
        total_current_streaks: 0,
        longest_overall_streak: 0,
        most_consistent_habit_id: null,
        most_consistent_habit_name: null,
        most_consistent_habit_rate: null,
      };
      return NextResponse.json(emptySummary);
    }

    const summary = summaryResult[0];

    const analyticsSummary: AnalyticsSummary = {
      total_habits: parseInt(summary.total_habits) || 0,
      active_habits: parseInt(summary.active_habits) || 0,
      total_tasks: totalTasks,
      active_tasks: activeTasks,
      average_completion_rate: parseFloat(summary.average_completion_rate) || 0,
      total_current_streaks: parseInt(summary.total_current_streaks) || 0,
      longest_overall_streak: parseInt(summary.longest_overall_streak) || 0,
      most_consistent_habit_id: summary.most_consistent_habit_id || null,
      most_consistent_habit_name: summary.most_consistent_habit_name || null,
      most_consistent_habit_rate:
        summary.most_consistent_habit_rate !== null
          ? parseFloat(summary.most_consistent_habit_rate)
          : null,
    };

    return NextResponse.json(analyticsSummary);
  } catch (error) {
    console.error('Error in analytics summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
