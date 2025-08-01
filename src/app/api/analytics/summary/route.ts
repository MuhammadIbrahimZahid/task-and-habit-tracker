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

    if (!summaryResult || summaryResult.length === 0) {
      // Return empty summary if no data
      return NextResponse.json({
        total_habits: 0,
        active_habits: 0,
        average_completion_rate: 0,
        total_current_streaks: 0,
        longest_overall_streak: 0,
        most_consistent_habit: null,
      });
    }

    const summary = summaryResult[0];

    const analyticsSummary: AnalyticsSummary = {
      total_habits: parseInt(summary.total_habits) || 0,
      active_habits: parseInt(summary.active_habits) || 0,
      average_completion_rate: parseFloat(summary.average_completion_rate) || 0,
      total_current_streaks: summary.total_current_streaks || 0,
      longest_overall_streak: summary.longest_overall_streak || 0,
      most_consistent_habit: summary.most_consistent_habit_id
        ? {
            habit_id: summary.most_consistent_habit_id,
            habit_name: summary.most_consistent_habit_name || '',
            completion_rate:
              parseFloat(summary.most_consistent_habit_rate) || 0,
          }
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
