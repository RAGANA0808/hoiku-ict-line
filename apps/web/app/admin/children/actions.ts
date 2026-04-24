'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const childSchema = z.object({
  familyName: z.string().min(1).max(50),
  givenName: z.string().min(1).max(50),
  familyNameKana: z.string().max(50).optional().nullable(),
  givenNameKana: z.string().max(50).optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  enrolledOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  withdrewOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  photoConsent: z.boolean(),
});

const parseFormData = (formData: FormData) =>
  childSchema.parse({
    familyName: formData.get('familyName'),
    givenName: formData.get('givenName'),
    familyNameKana: (formData.get('familyNameKana') as string) || null,
    givenNameKana: (formData.get('givenNameKana') as string) || null,
    birthDate: formData.get('birthDate'),
    enrolledOn: formData.get('enrolledOn'),
    withdrewOn: (formData.get('withdrewOn') as string) || null,
    photoConsent: formData.get('photoConsent') === 'on',
  });

const toRow = (v: z.infer<typeof childSchema>) => ({
  family_name: v.familyName,
  given_name: v.givenName,
  family_name_kana: v.familyNameKana,
  given_name_kana: v.givenNameKana,
  birth_date: v.birthDate,
  enrolled_on: v.enrolledOn,
  withdrew_on: v.withdrewOn,
  photo_consent: v.photoConsent,
});

export const createChild = async (formData: FormData) => {
  const values = parseFormData(formData);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId =
    (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id ?? null;
  if (!tenantId) throw new Error('tenant_id がJWTに含まれていません。');

  const { error } = await supabase
    .from('children')
    .insert({ ...toRow(values), tenant_id: tenantId });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/children');
  redirect('/admin/children');
};

export const updateChild = async (id: string, formData: FormData) => {
  const values = parseFormData(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('children').update(toRow(values)).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/children');
  redirect('/admin/children');
};

export const deleteChild = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('children')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/children');
};
