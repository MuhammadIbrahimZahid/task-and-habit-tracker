import { createClient } from '@/utils/supabase/client';
import { Task } from '@/types/task';

// Fetch tasks for a user
export async function fetchTasks(userId: string) {
  const supabase = createClient(); // No `await` needed in client

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Create a new task
export async function createTask(taskData: {
  userId: string;
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}) {
  const supabase = createClient(); // No `await` needed in client

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: taskData.userId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          due_date: taskData.dueDate,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Update an existing task
export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = createClient(); // No `await` needed in client

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Delete a task (soft delete)
export async function deleteTask(taskId: string) {
  const supabase = createClient(); // No `await` needed in client

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
