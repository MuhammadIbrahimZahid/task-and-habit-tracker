'use server';

import { createClient } from '@/utils/supabase/server';

export async function signInWithGoogle(redirectTo: string) {
  const supabase = await createClient();

  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_SITE_URL ||
      'https://your-vercel-domain.vercel.app';

  const redirectUrl = `${baseUrl}/auth/callback?next=${redirectTo}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
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
