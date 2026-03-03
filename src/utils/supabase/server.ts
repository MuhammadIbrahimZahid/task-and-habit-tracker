import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieOptions = {
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
};

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies(); // make sure we await if it's a Promise

  const getAllCookies = (): CookieToSet[] => {
    // Read all cookies from ReadonlyRequestCookies
    return cookieStore.getAll().map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return getAllCookies();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // Only attempt to set if the cookie store has 'set'
          if ('set' in cookieStore) {
            cookiesToSet.forEach(({ name, value, options }) =>
              (cookieStore as any).set(name, value, options),
            );
          }
        },
      },
    },
  );
}
