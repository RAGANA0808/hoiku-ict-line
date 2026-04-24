import { getCurrentUser } from '@/lib/auth/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  let stats: { children: number; classes: number; guardians: number } | null = null;
  if (user?.tenantId) {
    const supabase = await createSupabaseServerClient();
    const [children, classes, guardians] = await Promise.all([
      supabase.from('children').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('guardians').select('*', { count: 'exact', head: true }),
    ]);
    stats = {
      children: children.count ?? 0,
      classes: classes.count ?? 0,
      guardians: guardians.count ?? 0,
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p className="mt-1 text-sm text-slate-500">
        {user?.email ?? 'ゲスト'} としてログイン中
        {user?.role && <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs">{user.role}</span>}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="園児" value={stats?.children ?? '—'} href="/admin/children" />
        <StatCard label="クラス" value={stats?.classes ?? '—'} href="/admin/classes" />
        <StatCard label="保護者" value={stats?.guardians ?? '—'} href="/admin/guardians" />
      </div>

      <div className="mt-10 rounded-xl border bg-white p-6 text-sm text-slate-600">
        <div className="font-semibold text-slate-900">Phase 1 進行中</div>
        <p className="mt-1">マスタ管理(園児・クラス・保護者・招待コード・CSV import・シード)を実装しています。</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </a>
  );
}
