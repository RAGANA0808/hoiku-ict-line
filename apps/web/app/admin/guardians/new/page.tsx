import Link from 'next/link';
import { createGuardian } from '../actions';
import { GuardianForm } from '../_components/guardian-form';

export default function NewGuardianPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/guardians" className="text-sm text-slate-500 underline">
        ← 保護者一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">保護者 新規登録</h1>
      <div className="mt-6 rounded-xl border bg-white p-6">
        <GuardianForm action={createGuardian} submitLabel="登録する" />
      </div>
    </div>
  );
}
