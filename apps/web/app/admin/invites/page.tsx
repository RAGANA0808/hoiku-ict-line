import { createSupabaseServerClient } from '@/lib/supabase/server';
import { issueInviteCode, revokeInviteCode } from './actions';

type InviteRow = {
  id: string;
  code: string;
  expires_at: string;
  consumed_at: string | null;
  guardians: { id: string; family_name: string; given_name: string } | null;
};

export default async function InvitesPage() {
  const supabase = await createSupabaseServerClient();

  const [invitesRes, guardiansRes] = await Promise.all([
    supabase
      .from('guardian_invite_codes')
      .select('id, code, expires_at, consumed_at, guardians ( id, family_name, given_name )')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('guardians')
      .select('id, family_name, given_name')
      .is('deleted_at', null)
      .order('family_name'),
  ]);

  const invites: InviteRow[] = (invitesRes.data as InviteRow[] | null) ?? [];
  const guardians = guardiansRes.data ?? [];
  const now = new Date();

  const statusOf = (row: InviteRow): { label: string; tone: string } => {
    if (row.consumed_at) return { label: '使用済み', tone: 'bg-slate-200 text-slate-700' };
    if (new Date(row.expires_at) < now) return { label: '期限切れ', tone: 'bg-slate-200 text-slate-500' };
    return { label: '有効', tone: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">招待コード</h1>
      <p className="mt-1 text-sm text-slate-600">
        保護者がLINE公式アカウントで初回登録するときに入力するコードです。
      </p>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="text-sm font-semibold">新規発行</div>
        {guardians.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            先に保護者を登録してください。
          </p>
        ) : (
          <form action={issueInviteCode} className="mt-3 grid gap-3 sm:grid-cols-4">
            <select name="guardianId" required className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
              {guardians.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.family_name} {g.given_name}
                </option>
              ))}
            </select>
            <label className="text-sm">
              有効日数
              <input
                type="number"
                name="validDays"
                min={1}
                max={30}
                defaultValue={7}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              発行する
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">コード</th>
              <th className="px-4 py-3">保護者</th>
              <th className="px-4 py-3">有効期限</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  発行済みコードはありません。
                </td>
              </tr>
            )}
            {invites.map((inv) => {
              const s = statusOf(inv);
              const revokeAction = async () => {
                'use server';
                await revokeInviteCode(inv.id);
              };
              return (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-3 font-mono">{inv.code}</td>
                  <td className="px-4 py-3">
                    {inv.guardians?.family_name} {inv.guardians?.given_name}
                  </td>
                  <td className="px-4 py-3">{new Date(inv.expires_at).toLocaleString('ja-JP')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${s.tone}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.label === '有効' && (
                      <form action={revokeAction}>
                        <button type="submit" className="text-sm text-rose-600 underline">
                          失効
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
