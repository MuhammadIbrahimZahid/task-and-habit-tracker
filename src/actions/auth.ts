'use server';

import { createClient } from '@/utils/supabase/server';

export async function signInWithGoogle(redirectTo: string = '/dashboard') {
  const supabase = await createClient();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://task-and-habit-tracker.vercel.app';

  const redirectUrl = `${baseUrl}${redirectTo}`; // Just the final page

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl, // <-- only the target page
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
