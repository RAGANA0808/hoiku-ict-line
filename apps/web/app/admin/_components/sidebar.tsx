import Link from 'next/link';
import { signOut } from '@/app/login/actions';

type NavItem = {
  href: string;
  label: string;
  section?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'ダッシュボード' },
  { section: '園児・保護者', href: '/admin/children', label: '園児' },
  { href: '/admin/classes', label: 'クラス' },
  { href: '/admin/guardians', label: '保護者' },
  { href: '/admin/invites', label: '招待コード' },
  { section: '職員', href: '/admin/staff', label: '職員管理' },
  { section: '設定', href: '/admin/settings/line-channels', label: 'LINE連携' },
  { href: '/admin/settings/tenant', label: 'テナント設定' },
];

type SidebarProps = {
  currentPath: string;
  tenantName: string | null;
  userEmail: string;
};

export function Sidebar({ currentPath, tenantName, userEmail }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <div className="text-sm font-semibold">保育ICT</div>
          <div className="text-xs text-slate-500">{tenantName ?? '(テナント未設定)'}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 p-4 text-sm">
        {NAV_ITEMS.map((item) => {
          const active =
            currentPath === item.href ||
            (item.href !== '/admin' && currentPath.startsWith(`${item.href}/`));
          return (
            <div key={item.href}>
              {item.section && (
                <div className="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.section}
                </div>
              )}
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4 text-xs text-slate-600">
        <div className="truncate">{userEmail}</div>
        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-md border px-3 py-2 text-left hover:bg-slate-50"
          >
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
