import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabaseEnv } from '../env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const createSupabaseServerClient = async () => {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: CookieToSet[]) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component から set が呼ばれた場合の無視 (middlewareが面倒を見る)
        }
      },
    },
  });
};
