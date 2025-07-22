export interface Habit {
  id: string; // UUID as a string
  user_id: string; // UUID as a string
  name: string;
  description: string;
  goal_type: 'daily' | 'weekly' | 'monthly'; // Enum values
  goal_target: number; // Integer
  color: string; // Hex color code or any string
  is_active: boolean;
  created_at: string; // ISO string format
  updated_at: string; // ISO string format
  deleted_at: string | null; // Add this field in TypeScript
}

export interface HabitEvent {
  id: string; // UUID as a string
  habit_id: string; // UUID as a string
  user_id: string; // UUID as a string
  event_date: string; // ISO date string format
  note: string | null; // Text or null
  created_at: string; // ISO string format
  updated_at: string; // ISO string format
  deleted_at: string | null; // Add this field in TypeScript
}
