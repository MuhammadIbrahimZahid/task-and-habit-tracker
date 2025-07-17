export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed'; // Enum-like field
  priority: 'low' | 'medium' | 'high'; // Check constraint values
  due_date: string | null; // ISO 8601 string or null
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
  deleted_at: string | null; // ISO 8601 string or null
};
