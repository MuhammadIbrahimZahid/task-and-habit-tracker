import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { StreakData } from '@/types/analytics';

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
      return NextResponse.json({ streaks: [] });
    }

    // Get streak data for each habit using the SQL function
    const streaksData: StreakData[] = [];

    for (const habit of habits) {
      const { data: streakResult, error: streakError } = await supabase.rpc(
        'get_habit_streak',
        { habit_id: habit.id },
      );

      if (streakError) {
        console.error(
          `Error getting streak for habit ${habit.id}:`,
          streakError,
        );
        continue;
      }

      if (streakResult && streakResult.length > 0) {
        const streak = streakResult[0];
        streaksData.push({
          habit_id: habit.id,
          habit_name: habit.name,
          current_streak: streak.current_streak || 0,
          longest_streak: streak.longest_streak || 0,
          total_completions: parseInt(streak.total_completions) || 0,
          last_completion_date: streak.last_completion_date,
          streak_start_date: streak.streak_start_date,
        });
      }
    }

    return NextResponse.json({
      streaks: streaksData,
      total_habits: habits.length,
      total_current_streaks: streaksData.reduce(
        (sum, streak) => sum + streak.current_streak,
        0,
      ),
      longest_overall_streak: Math.max(
        ...streaksData.map((s) => s.longest_streak),
        0,
      ),
    });
  } catch (error) {
    console.error('Error in streaks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
