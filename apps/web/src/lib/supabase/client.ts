import { createBrowserClient } from '@supabase/ssr';
import { requireSupabaseEnv } from '../env';

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient(url, anonKey);
};
