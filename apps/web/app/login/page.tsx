import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/env';
import { signIn } from './actions';

type PageProps = {
  searchParams: Promise<{ reason?: string; redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { reason, redirect, error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">保育ICT ログイン</h1>
        <p className="mt-1 text-sm text-slate-600">職員アカウントでログインしてください。</p>

        {!configured && (
          <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            Supabase環境変数が未設定です。<code className="font-mono">apps/web/.env.local</code> を設定後に再起動してください。
          </div>
        )}

        {reason === 'signed-out' && (
          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            ログアウトしました。
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-900">{error}</div>
        )}

        <form action={signIn} className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={redirect ?? '/admin'} />
          <label className="block text-sm font-medium">
            メールアドレス
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            パスワード
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              minLength={8}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ログイン
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          <Link href="/" className="underline">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
