'use client';

import { useState, useTransition } from 'react';
import { importChildrenCsv, type ImportResult } from './actions';

export function ImportForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await importChildrenCsv(formData);
      setResult(res);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="block w-full rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? '読み込み中…' : 'アップロード'}
      </button>

      {result && (
        <div className="mt-4 rounded-md border bg-slate-50 p-4 text-sm">
          <div className="font-semibold">
            結果: {result.inserted} 件登録 / {result.errors.length} 件エラー
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-rose-700">
              {result.errors.map((e, i) => (
                <li key={i}>
                  L{e.line}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
