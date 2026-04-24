'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { generateInviteCode } from '@hoiku/lib';
import { encrypt } from '@/lib/crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const createSchema = z.object({
  messagingChannelId: z.string().min(1).max(32),
  messagingChannelSecret: z.string().min(10).max(256),
  messagingAccessToken: z.string().min(10).max(512),
  loginChannelId: z.string().optional().nullable(),
  loginChannelSecret: z.string().optional().nullable(),
});

const updateSchema = createSchema.extend({
  messagingChannelSecret: z.string().optional().nullable(),
  messagingAccessToken: z.string().optional().nullable(),
  loginChannelSecret: z.string().optional().nullable(),
  isActive: z.boolean(),
});

const generateWebhookPathCode = (): string => generateInviteCode(12).toLowerCase();

export const createLineChannel = async (formData: FormData) => {
  const parsed = createSchema.parse({
    messagingChannelId: formData.get('messagingChannelId'),
    messagingChannelSecret: formData.get('messagingChannelSecret'),
    messagingAccessToken: formData.get('messagingAccessToken'),
    loginChannelId: (formData.get('loginChannelId') as string) || null,
    loginChannelSecret: (formData.get('loginChannelSecret') as string) || null,
  });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) throw new Error('tenant_id not in JWT');

  const row = {
    tenant_id: tenantId,
    webhook_path_code: generateWebhookPathCode(),
    messaging_channel_id: parsed.messagingChannelId,
    messaging_channel_secret_enc: encrypt(parsed.messagingChannelSecret),
    messaging_access_token_enc: encrypt(parsed.messagingAccessToken),
    login_channel_id: parsed.loginChannelId,
    login_channel_secret_enc: parsed.loginChannelSecret ? encrypt(parsed.loginChannelSecret) : null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('line_channels')
    .insert(row)
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/admin/settings/line-channels');
  redirect(`/admin/settings/line-channels/${data.id}`);
};

export const updateLineChannel = async (id: string, formData: FormData) => {
  const parsed = updateSchema.parse({
    messagingChannelId: formData.get('messagingChannelId'),
    messagingChannelSecret: (formData.get('messagingChannelSecret') as string) || null,
    messagingAccessToken: (formData.get('messagingAccessToken') as string) || null,
    loginChannelId: (formData.get('loginChannelId') as string) || null,
    loginChannelSecret: (formData.get('loginChannelSecret') as string) || null,
    isActive: formData.get('isActive') === 'on',
  });

  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = {
    messaging_channel_id: parsed.messagingChannelId,
    login_channel_id: parsed.loginChannelId,
    is_active: parsed.isActive,
  };
  if (parsed.messagingChannelSecret) {
    update.messaging_channel_secret_enc = encrypt(parsed.messagingChannelSecret);
  }
  if (parsed.messagingAccessToken) {
    update.messaging_access_token_enc = encrypt(parsed.messagingAccessToken);
  }
  if (parsed.loginChannelSecret) {
    update.login_channel_secret_enc = encrypt(parsed.loginChannelSecret);
  }

  const { error } = await supabase.from('line_channels').update(update).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/settings/line-channels');
  revalidatePath(`/admin/settings/line-channels/${id}`);
};

export const deleteLineChannel = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('line_channels')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings/line-channels');
  redirect('/admin/settings/line-channels');
};
