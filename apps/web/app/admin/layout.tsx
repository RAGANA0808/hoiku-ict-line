import { headers } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Sidebar } from './_components/sidebar';
import { MobileHeader } from './_components/mobile-header';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const currentPath = (await headers()).get('x-pathname') ?? '/admin';

  let tenantName: string | null = null;
  if (user?.tenantId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('tenants').select('name').eq('id', user.tenantId).single();
    tenantName = data?.name ?? null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPath={currentPath}
        tenantName={tenantName}
        userEmail={user?.email ?? ''}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader tenantName={tenantName} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
