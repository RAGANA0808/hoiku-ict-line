import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { deleteLineChannel, updateLineChannel } from '../actions';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLineChannelPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('line_channels')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (!data) notFound();

  const webhookUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/line/webhook/${data.webhook_path_code}`;

  const updateAction = async (formData: FormData) => {
    'use server';
    await updateLineChannel(id, formData);
  };

  const deleteAction = async () => {
    'use server';
    await deleteLineChannel(id);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/settings/line-channels" className="text-sm text-slate-500 underline">
        ← LINE連携設定
      </Link>
      <h1 className="mt-2 text-2xl font-bold">LINE公式アカウント設定</h1>

      <div className="mt-4 rounded-xl border bg-slate-900 p-4 font-mono text-xs text-slate-100">
        <div className="mb-1 text-slate-400">Webhook URL (LINE Developers Console に設定)</div>
        <div className="break-all">{webhookUrl}</div>
      </div>

      <form action={updateAction} className="mt-6 space-y-6 rounded-xl border bg-white p-6">
        <section className="space-y-3">
          <div className="text-sm font-semibold">Messaging API チャネル</div>
          <Field
            label="Channel ID"
            name="messagingChannelId"
            required
            defaultValue={data.messaging_channel_id}
          />
          <Field
            label="Channel secret"
            name="messagingChannelSecret"
            type="password"
            hint="変更する場合のみ入力 (保存済み: AES-256-GCM 暗号化済)"
          />
          <Field
            label="Channel access token"
            name="messagingAccessToken"
            type="password"
            hint="変更する場合のみ入力"
          />
        </section>

        <section className="space-y-3 border-t pt-6">
          <div className="text-sm font-semibold">LINE Login チャネル</div>
          <Field
            label="Login Channel ID"
            name="loginChannelId"
            defaultValue={data.login_channel_id ?? ''}
          />
          <Field
            label="Login Channel secret"
            name="loginChannelSecret"
            type="password"
            hint={
              data.login_channel_secret_enc
                ? '変更する場合のみ入力 (保存済み)'
                : '未登録'
            }
          />
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={data.is_active}
            className="size-4"
          />
          有効
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
            チャネルを削除する (論理削除)
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        autoComplete="off"
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
