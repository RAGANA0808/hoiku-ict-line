import { signOut } from '@/app/login/actions';

type MobileHeaderProps = {
  tenantName: string | null;
};

export function MobileHeader({ tenantName }: MobileHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
      <div>
        <div className="text-sm font-semibold">保育ICT</div>
        <div className="text-[11px] text-slate-500">{tenantName ?? '(テナント未設定)'}</div>
      </div>
      <form action={signOut}>
        <button type="submit" className="text-xs text-slate-600 underline">
          ログアウト
        </button>
      </form>
    </header>
  );
}
