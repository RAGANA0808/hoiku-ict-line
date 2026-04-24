import Link from 'next/link';
import { ChildForm } from '../_components/child-form';
import { createChild } from '../actions';

export default function NewChildPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/children" className="text-sm text-slate-500 underline">
        ← 園児一覧へ
      </Link>
      <h1 className="mt-2 text-2xl font-bold">園児 新規登録</h1>
      <div className="mt-6 rounded-xl border bg-white p-6">
        <ChildForm action={createChild} submitLabel="登録する" />
      </div>
    </div>
  );
}
