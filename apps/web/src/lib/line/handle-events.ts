import {
  type LineFollowEvent,
  type LineTextMessageEvent,
  type LineWebhookEvent,
  replyMessage,
  text,
} from '@hoiku/line';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChannelContext = {
  tenantId: string;
  lineChannelId: string;
  accessToken: string;
};

const upsertLineUser = async (
  supabase: SupabaseClient,
  ctx: ChannelContext,
  lineUserId: string,
  patch: Record<string, unknown>,
): Promise<void> => {
  const { data: existing } = await supabase
    .from('line_users')
    .select('id')
    .eq('line_channel_id', ctx.lineChannelId)
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('line_users').update(patch).eq('id', existing.id);
  } else {
    await supabase.from('line_users').insert({
      tenant_id: ctx.tenantId,
      line_channel_id: ctx.lineChannelId,
      line_user_id: lineUserId,
      ...patch,
    });
  }
};

export const handleLineEvent = async (
  supabase: SupabaseClient,
  ctx: ChannelContext,
  event: LineWebhookEvent,
): Promise<void> => {
  const userId = event.source?.userId;

  if (event.type === 'follow' && userId) {
    const follow = event as LineFollowEvent;
    await upsertLineUser(supabase, ctx, userId, {
      followed_at: new Date().toISOString(),
      unfollowed_at: null,
    });
    await replyMessage(
      follow.replyToken,
      [
        text('友だち追加ありがとうございます。'),
        text('保護者登録用のコードを入力してください。'),
      ],
      ctx.accessToken,
    ).catch((err: unknown) => {
      console.error('LINE reply (follow) failed:', err);
    });
    return;
  }

  if (event.type === 'unfollow' && userId) {
    await upsertLineUser(supabase, ctx, userId, {
      unfollowed_at: new Date().toISOString(),
    });
    return;
  }

  if (event.type === 'message' && userId) {
    const msgEvent = event as LineTextMessageEvent;
    if (msgEvent.message?.type === 'text' && msgEvent.message.text) {
      const body = msgEvent.message.text.trim();
      if (body.includes('欠席')) {
        await replyMessage(
          msgEvent.replyToken,
          [text('欠席連絡画面を開きます。LIFFメニューの「欠席連絡」からご登録ください。')],
          ctx.accessToken,
        ).catch((err: unknown) => {
          console.error('LINE reply (absence) failed:', err);
        });
      }
    }
    return;
  }
};
