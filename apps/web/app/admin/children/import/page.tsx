import Link from 'next/link';
import { ImportForm } from './_form';

export default function ImportChildrenPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/children" className="text-sm text-slate-500 underline">
        ← 園児一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">園児 CSV 一括登録</h1>

      <div className="mt-6 rounded-xl border bg-white p-6 text-sm">
        <div className="font-semibold">CSVフォーマット</div>
        <p className="mt-1 text-slate-600">
          以下のヘッダを含む CSV (UTF-8) をアップロードしてください。
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
{`family_name,given_name,family_name_kana,given_name_kana,birth_date,enrolled_on,photo_consent
山田,太郎,ヤマダ,タロウ,2020-04-01,2024-04-01,true
佐藤,花子,サトウ,ハナコ,2021-06-15,2024-04-01,false`}
        </pre>
        <ul className="mt-3 list-inside list-disc text-slate-600">
          <li>日付は <code>YYYY-MM-DD</code> 形式</li>
          <li><code>photo_consent</code> は <code>true</code> / <code>false</code> / <code>1</code> / <code>0</code></li>
          <li>既存の園児を更新する機能は含みません (重複を避けて事前に整理してください)</li>
        </ul>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <ImportForm />
      </div>
    </div>
  );
}
