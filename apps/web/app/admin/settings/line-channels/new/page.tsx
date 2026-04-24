import Link from 'next/link';
import { createLineChannel } from '../actions';

export default function NewLineChannelPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/settings/line-channels" className="text-sm text-slate-500 underline">
        ← LINE連携設定
      </Link>
      <h1 className="mt-2 text-2xl font-bold">LINE公式アカウント登録</h1>

      <div className="mt-4 rounded-xl border bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">事前準備</div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>LINE Developers Console でプロバイダーを作成</li>
          <li>Messaging API チャネル作成 → チャネルID・シークレット・アクセストークンを取得</li>
          <li>
            (保護者のLIFF登録を使う場合) 同じプロバイダー配下に LINE Login チャネルも作成
          </li>
        </ul>
      </div>

      <form action={createLineChannel} className="mt-6 space-y-6 rounded-xl border bg-white p-6">
        <section className="space-y-3">
          <div className="text-sm font-semibold">Messaging API チャネル</div>
          <Field
            label="Channel ID"
            name="messagingChannelId"
            required
            placeholder="例: 1234567890"
          />
          <Field
            label="Channel secret"
            name="messagingChannelSecret"
            type="password"
            required
            hint="LINE Developers Console → Basic settings → Channel secret"
          />
          <Field
            label="Channel access token (long-lived)"
            name="messagingAccessToken"
            type="password"
            required
            hint="LINE Developers Console → Messaging API → Channel access token (long-lived)"
          />
        </section>

        <section className="space-y-3 border-t pt-6">
          <div className="text-sm font-semibold">
            LINE Login チャネル (LIFF用、あとから登録可)
          </div>
          <Field label="Login Channel ID" name="loginChannelId" placeholder="任意" />
          <Field label="Login Channel secret" name="loginChannelSecret" type="password" />
        </section>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          登録する
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
