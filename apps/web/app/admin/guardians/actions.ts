'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  familyName: z.string().min(1).max(50),
  givenName: z.string().min(1).max(50),
  relation: z.string().max(20).optional().nullable(),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-() ]*$/)
    .optional()
    .nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
});

const parse = (formData: FormData) =>
  schema.parse({
    familyName: formData.get('familyName'),
    givenName: formData.get('givenName'),
    relation: (formData.get('relation') as string) || null,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
  });

const toRow = (v: z.infer<typeof schema>) => ({
  family_name: v.familyName,
  given_name: v.givenName,
  relation: v.relation,
  phone: v.phone,
  email: v.email || null,
});

export const createGuardian = async (formData: FormData) => {
  const values = parse(formData);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) throw new Error('tenant_id not in JWT');

  const { error } = await supabase
    .from('guardians')
    .insert({ ...toRow(values), tenant_id: tenantId });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/guardians');
  redirect('/admin/guardians');
};

export const updateGuardian = async (id: string, formData: FormData) => {
  const values = parse(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('guardians').update(toRow(values)).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/guardians');
  redirect('/admin/guardians');
};

export const deleteGuardian = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('guardians')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/guardians');
};

const linkSchema = z.object({
  guardianId: z.string().uuid(),
  childId: z.string().uuid(),
  isPrimary: z.boolean(),
});

export const linkGuardianToChild = async (formData: FormData) => {
  const values = linkSchema.parse({
    guardianId: formData.get('guardianId'),
    childId: formData.get('childId'),
    isPrimary: formData.get('isPrimary') === 'on',
  });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) throw new Error('tenant_id not in JWT');

  const { error } = await supabase.from('guardian_child_links').insert({
    tenant_id: tenantId,
    guardian_id: values.guardianId,
    child_id: values.childId,
    is_primary: values.isPrimary,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/guardians/${values.guardianId}`);
};
