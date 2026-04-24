'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  fiscalYear: z.coerce.number().int().min(2020).max(2100),
  name: z.string().min(1).max(50),
  ageGroup: z.string().max(20).optional().nullable(),
});

const parse = (formData: FormData) =>
  schema.parse({
    fiscalYear: formData.get('fiscalYear'),
    name: formData.get('name'),
    ageGroup: (formData.get('ageGroup') as string) || null,
  });

const toRow = (v: z.infer<typeof schema>) => ({
  fiscal_year: v.fiscalYear,
  name: v.name,
  age_group: v.ageGroup,
});

export const createClass = async (formData: FormData) => {
  const values = parse(formData);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) throw new Error('tenant_id not in JWT');

  const { error } = await supabase.from('classes').insert({ ...toRow(values), tenant_id: tenantId });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/classes');
  redirect('/admin/classes');
};

export const updateClass = async (id: string, formData: FormData) => {
  const values = parse(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('classes').update(toRow(values)).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/classes');
  redirect('/admin/classes');
};

export const deleteClass = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('classes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/classes');
};
