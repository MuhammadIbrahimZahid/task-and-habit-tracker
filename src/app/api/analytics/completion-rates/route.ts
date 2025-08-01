import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { CompletionRateData } from '@/types/analytics';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period =
      (searchParams.get('period') as 'week' | 'month' | 'year') || 'month';

    // Calculate date range based on period
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (period) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    // Get all active habits for the user
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, color')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      return NextResponse.json(
        { error: 'Failed to fetch habits' },
        { status: 500 },
      );
    }

    if (!habits || habits.length === 0) {
      return NextResponse.json({ completionRates: [] });
    }

    // Get completion rate data for each habit using the SQL function
    const completionRatesData: CompletionRateData[] = [];

    for (const habit of habits) {
      const { data: rateResult, error: rateError } = await supabase.rpc(
        'get_completion_rate',
        {
          habit_id: habit.id,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
        },
      );

      if (rateError) {
        console.error(
          `Error getting completion rate for habit ${habit.id}:`,
          rateError,
        );
        continue;
      }

      if (rateResult && rateResult.length > 0) {
        const rate = rateResult[0];
        completionRatesData.push({
          habit_id: habit.id,
          habit_name: habit.name,
          completion_rate: parseFloat(rate.completion_rate) || 0,
          total_days: rate.total_days || 0,
          completed_days: parseInt(rate.completed_days) || 0,
          period,
          period_start: rate.period_start_date,
          period_end: rate.period_end_date,
        });
      }
    }

    // Calculate overall average completion rate
    const averageCompletionRate =
      completionRatesData.length > 0
        ? completionRatesData.reduce(
            (sum, rate) => sum + rate.completion_rate,
            0,
          ) / completionRatesData.length
        : 0;

    return NextResponse.json({
      completionRates: completionRatesData,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      period,
      periodStart: startDate.toISOString().split('T')[0],
      periodEnd: endDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error in completion rates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
