import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ChannelRow = {
  id: string;
  webhook_path_code: string;
  messaging_channel_id: string;
  login_channel_id: string | null;
  is_active: boolean;
  updated_at: string;
};

export default async function LineChannelsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('line_channels')
    .select('id, webhook_path_code, messaging_channel_id, login_channel_id, is_active, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  const rows: ChannelRow[] = (data as ChannelRow[] | null) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LINE連携設定</h1>
          <p className="mt-1 text-sm text-slate-600">
            園のLINE公式アカウントを登録します。シークレットは AES-256-GCM で暗号化して保存されます。
          </p>
        </div>
        {rows.length === 0 && (
          <Link
            href="/admin/settings/line-channels/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            + 新規登録
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-8 text-center">
          <div className="text-sm text-slate-500">
            まだ LINE 公式アカウントが登録されていません。
          </div>
          <div className="mt-2 text-xs text-slate-500">
            LINE Developers Console で Messaging API チャネルと LIFF を作成してから登録してください。
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/admin/settings/line-channels/${c.id}`}
              className="block rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    Messaging Channel ID: {c.messaging_channel_id}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Webhook URL の識別子: <span className="font-mono">{c.webhook_path_code}</span>
                  </div>
                  {c.login_channel_id && (
                    <div className="mt-1 text-xs text-slate-500">
                      Login Channel ID: {c.login_channel_id}
                    </div>
                  )}
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {c.is_active ? '有効' : '無効'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
