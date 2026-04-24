'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { generateInviteCode } from '@hoiku/lib';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  guardianId: z.string().uuid(),
  validDays: z.coerce.number().int().min(1).max(30).default(7),
});

export const issueInviteCode = async (formData: FormData) => {
  const values = schema.parse({
    guardianId: formData.get('guardianId'),
    validDays: formData.get('validDays') ?? 7,
  });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) throw new Error('tenant_id not in JWT');

  const code = generateInviteCode(8);
  const expiresAt = new Date(Date.now() + values.validDays * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('guardian_invite_codes').insert({
    tenant_id: tenantId,
    guardian_id: values.guardianId,
    code,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/invites');
};

export const revokeInviteCode = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('guardian_invite_codes')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/invites');
};
