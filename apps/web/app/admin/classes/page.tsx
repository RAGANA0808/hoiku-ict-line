import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClass } from './actions';

type ClassRow = {
  id: string;
  fiscal_year: number;
  name: string;
  age_group: string | null;
};

export default async function ClassesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('classes')
    .select('id, fiscal_year, name, age_group')
    .is('deleted_at', null)
    .order('fiscal_year', { ascending: false })
    .order('name');
  const rows: ClassRow[] = (data as ClassRow[] | null) ?? [];

  const thisYear = new Date().getFullYear();

  return (
    <div>
      <h1 className="text-2xl font-bold">クラス</h1>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="text-sm font-semibold">新規クラス追加</div>
        <form action={createClass} className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="text-sm">
            年度
            <input
              type="number"
              name="fiscalYear"
              required
              defaultValue={thisYear}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            クラス名
            <input
              type="text"
              name="name"
              required
              placeholder="例: さくら組"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            年齢区分
            <input
              type="text"
              name="ageGroup"
              placeholder="例: 4歳児"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              追加
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">年度</th>
              <th className="px-4 py-3">クラス名</th>
              <th className="px-4 py-3">年齢区分</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  クラスが登録されていません。
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">{c.fiscal_year}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.age_group ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/classes/${c.id}`} className="text-sm text-slate-600 underline">
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
