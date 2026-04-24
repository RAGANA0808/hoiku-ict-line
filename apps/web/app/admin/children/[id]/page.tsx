import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ChildForm } from '../_components/child-form';
import { deleteChild, updateChild } from '../actions';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditChildPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!data) notFound();

  const updateAction = async (formData: FormData) => {
    'use server';
    await updateChild(id, formData);
  };

  const deleteAction = async () => {
    'use server';
    await deleteChild(id);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/children" className="text-sm text-slate-500 underline">
        ← 園児一覧へ
      </Link>
      <h1 className="mt-2 text-2xl font-bold">
        {data.family_name} {data.given_name}
      </h1>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <ChildForm
          action={updateAction}
          submitLabel="保存"
          defaultValues={{
            familyName: data.family_name,
            givenName: data.given_name,
            familyNameKana: data.family_name_kana,
            givenNameKana: data.given_name_kana,
            birthDate: data.birth_date,
            enrolledOn: data.enrolled_on,
            withdrewOn: data.withdrew_on,
            photoConsent: data.photo_consent,
          }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
        <div className="text-sm font-semibold text-rose-900">園児を削除(論理削除)</div>
        <p className="mt-1 text-xs text-rose-800">
          削除済みの園児は一覧に表示されません。データは保持されます。
        </p>
        <form action={deleteAction} className="mt-3">
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
