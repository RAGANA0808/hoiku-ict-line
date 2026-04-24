import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { deleteClass, updateClass } from '../actions';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditClassPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (!data) notFound();

  const updateAction = async (formData: FormData) => {
    'use server';
    await updateClass(id, formData);
  };

  const deleteAction = async () => {
    'use server';
    await deleteClass(id);
  };

  return (
    <div className="max-w-xl">
      <Link href="/admin/classes" className="text-sm text-slate-500 underline">
        ← クラス一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{data.name}</h1>
      <form action={updateAction} className="mt-6 space-y-4 rounded-xl border bg-white p-6">
        <label className="block text-sm">
          年度
          <input
            type="number"
            name="fiscalYear"
            required
            defaultValue={data.fiscal_year}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          クラス名
          <input
            type="text"
            name="name"
            required
            defaultValue={data.name}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          年齢区分
          <input
            type="text"
            name="ageGroup"
            defaultValue={data.age_group ?? ''}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          保存
        </button>
      </form>
      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm text-rose-900 hover:bg-rose-100"
          >
            削除する
          </button>
        </form>
      </div>
    </div>
  );
}
