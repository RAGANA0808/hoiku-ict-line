import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GuardianForm } from '../_components/guardian-form';
import { deleteGuardian, linkGuardianToChild, updateGuardian } from '../actions';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditGuardianPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: guardian } = await supabase
    .from('guardians')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (!guardian) notFound();

  type LinkRow = {
    id: string;
    is_primary: boolean;
    children: { id: string; family_name: string; given_name: string } | null;
  };

  const { data: linksRaw } = await supabase
    .from('guardian_child_links')
    .select('id, is_primary, children ( id, family_name, given_name )')
    .eq('guardian_id', id)
    .is('deleted_at', null);
  const links = (linksRaw as unknown as LinkRow[] | null) ?? [];

  const { data: allChildrenRaw } = await supabase
    .from('children')
    .select('id, family_name, given_name')
    .is('deleted_at', null)
    .order('family_name');
  const allChildren = allChildrenRaw ?? [];

  const linked = new Set(links.flatMap((l) => (l.children ? [l.children.id] : [])));
  const unlinkedChildren = allChildren.filter((c) => !linked.has(c.id));

  const updateAction = async (formData: FormData) => {
    'use server';
    await updateGuardian(id, formData);
  };

  const deleteAction = async () => {
    'use server';
    await deleteGuardian(id);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/guardians" className="text-sm text-slate-500 underline">
        ← 保護者一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">
        {guardian.family_name} {guardian.given_name}
      </h1>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <GuardianForm
          action={updateAction}
          defaultValues={{
            familyName: guardian.family_name,
            givenName: guardian.given_name,
            relation: guardian.relation,
            phone: guardian.phone,
            email: guardian.email,
          }}
        />
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="text-sm font-semibold">紐付く園児</div>
        <ul className="mt-3 space-y-2 text-sm">
          {links.length === 0 && <li className="text-slate-500">まだ紐付きがありません。</li>}
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                {l.children?.family_name} {l.children?.given_name}
                {l.is_primary && (
                  <span className="ml-2 rounded bg-slate-800 px-2 py-0.5 text-xs text-white">主保護者</span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {unlinkedChildren.length > 0 && (
          <form action={linkGuardianToChild} className="mt-4 grid gap-2 sm:grid-cols-3">
            <input type="hidden" name="guardianId" value={id} />
            <select name="childId" required className="rounded-md border px-3 py-2 text-sm">
              {unlinkedChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.family_name} {c.given_name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPrimary" /> 主保護者として登録
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              紐付ける
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm text-rose-900 hover:bg-rose-100"
          >
            保護者を削除する
          </button>
        </form>
      </div>
    </div>
  );
}
