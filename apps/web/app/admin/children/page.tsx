import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ChildRow = {
  id: string;
  family_name: string;
  given_name: string;
  birth_date: string;
  enrolled_on: string;
  withdrew_on: string | null;
};

export default async function ChildrenPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('children')
    .select('id, family_name, given_name, birth_date, enrolled_on, withdrew_on')
    .is('deleted_at', null)
    .order('family_name_kana', { ascending: true, nullsFirst: false });

  const children: ChildRow[] = (data as ChildRow[] | null) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">園児</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/children/import"
            className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
          >
            CSV一括登録
          </Link>
          <Link
            href="/admin/children/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + 新規登録
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-rose-50 p-4 text-sm text-rose-900">
          読み込みエラー: {error.message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">生年月日</th>
              <th className="px-4 py-3">入園日</th>
              <th className="px-4 py-3">退園日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {children.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  まだ園児が登録されていません。
                </td>
              </tr>
            )}
            {children.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">
                  {c.family_name} {c.given_name}
                </td>
                <td className="px-4 py-3">{c.birth_date}</td>
                <td className="px-4 py-3">{c.enrolled_on}</td>
                <td className="px-4 py-3 text-slate-500">{c.withdrew_on ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/children/${c.id}`}
                    className="text-sm text-slate-600 underline"
                  >
                    編集
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
