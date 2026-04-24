import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type GuardianRow = {
  id: string;
  family_name: string;
  given_name: string;
  relation: string | null;
  phone: string | null;
  email: string | null;
};

export default async function GuardiansPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('guardians')
    .select('id, family_name, given_name, relation, phone, email')
    .is('deleted_at', null)
    .order('family_name');
  const rows: GuardianRow[] = (data as GuardianRow[] | null) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">保護者</h1>
        <Link
          href="/admin/guardians/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          + 新規登録
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">続柄</th>
              <th className="px-4 py-3">電話</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  保護者が登録されていません。
                </td>
              </tr>
            )}
            {rows.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="px-4 py-3">
                  {g.family_name} {g.given_name}
                </td>
                <td className="px-4 py-3">{g.relation ?? '—'}</td>
                <td className="px-4 py-3">{g.phone ?? '—'}</td>
                <td className="px-4 py-3">{g.email ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/guardians/${g.id}`} className="text-sm text-slate-600 underline">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
