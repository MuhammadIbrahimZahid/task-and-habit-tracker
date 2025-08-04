import { createClient } from '../utils/supabase/client';
import { Habit, HabitEvent } from '@/types/habit';

// Helper function to validate Habit type at runtime
function isHabit(data: any): data is Habit {
  return (
    'id' in data &&
    'user_id' in data &&
    'name' in data &&
    'description' in data &&
    'goal_type' in data &&
    'goal_target' in data &&
    'color' in data &&
    'is_active' in data &&
    'created_at' in data &&
    'updated_at' in data &&
    'deleted_at' in data // Include `deleted_at` for validation
  );
}

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error occurred in fetchHabits for userId: ${userId}`, error);
    throw new Error(`Failed to fetch habits: ${error.message}`);
  }

  if (!data || !Array.isArray(data) || !data.every(isHabit)) {
    throw new Error('Invalid habit data returned from Supabase');
  }

  return data; // Type safe now
}

export async function createHabit(
  habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<Habit> {
  // Validate the habit object before inserting
  if (habit.goal_target < 0) {
    throw new Error('Goal target cannot be negative.');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .insert([habit])
    .select()
    .single();

  if (error) {
    console.error(`Error occurred in createHabit`, error);
    throw new Error(`Failed to create habit: ${error.message}`);
  }

  if (!isHabit(data)) {
    throw new Error('Invalid habit data returned from Supabase');
  }

  return data;
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Habit>,
): Promise<Habit> {
  if (updates.goal_target && updates.goal_target < 0) {
    throw new Error('Goal target cannot be negative.');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single();

  if (error) {
    console.error(
      `Error occurred in updateHabit for habitId: ${habitId}`,
      error,
    );
    throw new Error(`Failed to update habit: ${error.message}`);
  }

  if (!isHabit(data)) {
    throw new Error('Invalid habit data returned from Supabase');
  }

  return data;
}

export async function deleteHabit(habitId: string) {
  const supabase = createClient(); // No `await` needed in client

  try {
    const { data, error } = await supabase
      .from('habits')
      .update({ deleted_at: new Date() })
      .eq('id', habitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
}

export async function fetchHabitEvents(habitId: string): Promise<HabitEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_events')
    .select('*')
    .eq('habit_id', habitId)
    .order('event_date', { ascending: true });

  if (error) {
    console.error(
      `Error occurred in fetchHabitEvents for habitId: ${habitId}`,
      error,
    );
    throw new Error(`Failed to fetch habit events: ${error.message}`);
  }

  return data as HabitEvent[];
}

export async function toggleHabitEvent(
  habitId: string,
  eventDate: string,
  note?: string,
) {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Not authenticated');
  }
  const userId = session.user.id;

  const { data, error } = await supabase.from('habit_events').upsert(
    {
      habit_id: habitId,
      event_date: eventDate,
      user_id: userId,
      note,
    },
    {
      onConflict: 'habit_id,event_date', // ✅ string, not string[]
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchHabitDetails(habitId: string): Promise<Habit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .single(); // `single()` will ensure we only get one habit back

  if (error) {
    console.error(
      `Error occurred in fetchHabitDetails for habitId: ${habitId}`,
      error,
    );
    throw new Error(`Failed to fetch habit details: ${error.message}`);
  }

  if (!data || !isHabit(data)) {
    throw new Error('Invalid habit data returned from Supabase');
  }

  return data;
}
