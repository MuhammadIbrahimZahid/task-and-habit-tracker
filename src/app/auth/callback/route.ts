import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  let next = searchParams.get('next') ?? '/dashboard';
  if (!next.startsWith('/')) next = '/dashboard';

  if (code) {
    const supabase = await createClient();

    try {
      // Provide the code explicitly
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;
      if (!data?.session) throw new Error('No session returned');

      // Redirect safely
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('Failed to exchange code for session:', err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // If no code is present, redirect to sign-in
  return NextResponse.redirect(`${origin}/auth/sign-in`);
}
