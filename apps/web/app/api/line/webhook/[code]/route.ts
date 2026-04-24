import { verifyLineSignature, type LineWebhookBody } from '@hoiku/line';
import { NextResponse, type NextRequest } from 'next/server';
import { after } from 'next/server';
import { decrypt } from '@/lib/crypto';
import { handleLineEvent, type ChannelContext } from '@/lib/line/handle-events';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ code: string }> };

export const POST = async (request: NextRequest, { params }: RouteParams) => {
  const { code } = await params;
  const signature = request.headers.get('x-line-signature') ?? '';
  const rawBody = await request.text();

  const supabase = createSupabaseAdminClient();
  const { data: channel } = await supabase
    .from('line_channels')
    .select(
      'id, tenant_id, messaging_channel_id, messaging_channel_secret_enc, messaging_access_token_enc, is_active, deleted_at',
    )
    .eq('webhook_path_code', code)
    .maybeSingle();

  if (!channel || channel.deleted_at || !channel.is_active) {
    return NextResponse.json({ error: 'channel_not_found' }, { status: 404 });
  }

  let channelSecret: string;
  let accessToken: string;
  try {
    channelSecret = decrypt(channel.messaging_channel_secret_enc);
    accessToken = decrypt(channel.messaging_access_token_enc);
  } catch (err) {
    console.error('LINE channel secret decrypt failed:', err);
    return NextResponse.json({ error: 'decrypt_failed' }, { status: 500 });
  }

  if (!verifyLineSignature(channelSecret, rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (body.destination && body.destination !== channel.messaging_channel_id) {
    console.warn(
      `LINE webhook destination mismatch: expected ${channel.messaging_channel_id}, got ${body.destination}`,
    );
  }

  const ctx: ChannelContext = {
    tenantId: channel.tenant_id,
    lineChannelId: channel.id,
    accessToken,
  };

  after(async () => {
    for (const event of body.events ?? []) {
      try {
        await handleLineEvent(supabase, ctx, event);
      } catch (err) {
        console.error('LINE event handler failed:', err);
      }
    }
  });

  return NextResponse.json({ ok: true });
};

export const GET = () =>
  NextResponse.json({ ok: true, hint: 'POST LINE webhook events to this URL.' });
