import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CurrentUser = {
  authUserId: string;
  email: string;
  tenantId: string | null;
  role: string | null;
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const appMeta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  return {
    authUserId: data.user.id,
    email: data.user.email ?? '',
    tenantId: typeof appMeta.tenant_id === 'string' ? appMeta.tenant_id : null,
    role: typeof appMeta.role === 'string' ? appMeta.role : null,
  };
};
