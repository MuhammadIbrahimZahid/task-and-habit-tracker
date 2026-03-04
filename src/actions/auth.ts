'use server';

import { createClient } from '@/utils/supabase/server';

export async function signInWithGoogle() {
  const supabase = await createClient();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://task-and-habit-tracker.vercel.app';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  return data;
}
