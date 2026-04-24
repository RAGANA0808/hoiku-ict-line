'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parseCsv } from '@/lib/csv/parse';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const rowSchema = z.object({
  family_name: z.string().min(1),
  given_name: z.string().min(1),
  family_name_kana: z.string().optional().default(''),
  given_name_kana: z.string().optional().default(''),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'birth_date はYYYY-MM-DD' }),
  enrolled_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'enrolled_on はYYYY-MM-DD' }),
  photo_consent: z.enum(['true', 'false', '0', '1', '']).optional().default(''),
});

export type ImportResult = {
  inserted: number;
  errors: Array<{ line: number; message: string }>;
};

export const importChildrenCsv = async (formData: FormData): Promise<ImportResult> => {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { inserted: 0, errors: [{ line: 0, message: 'ファイルが添付されていません。' }] };
  }

  const text = await file.text();
  const parsed = parseCsv(text);
  if (!parsed.ok) {
    return { inserted: 0, errors: [{ line: 0, message: parsed.error }] };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tenantId = (user?.app_metadata as { tenant_id?: string } | undefined)?.tenant_id;
  if (!tenantId) {
    return { inserted: 0, errors: [{ line: 0, message: 'tenant_id がJWTに含まれていません。' }] };
  }

  const errors: Array<{ line: number; message: string }> = [];
  const rowsToInsert: Array<Record<string, unknown>> = [];

  parsed.rows.forEach((raw, idx) => {
    const line = idx + 2;
    const result = rowSchema.safeParse(raw);
    if (!result.success) {
      errors.push({ line, message: result.error.issues.map((e) => e.message).join(', ') });
      return;
    }
    const v = result.data;
    rowsToInsert.push({
      tenant_id: tenantId,
      family_name: v.family_name,
      given_name: v.given_name,
      family_name_kana: v.family_name_kana || null,
      given_name_kana: v.given_name_kana || null,
      birth_date: v.birth_date,
      enrolled_on: v.enrolled_on,
      photo_consent: v.photo_consent === 'true' || v.photo_consent === '1',
    });
  });

  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from('children').insert(rowsToInsert);
    if (error) {
      return { inserted: 0, errors: [{ line: 0, message: 'DB挿入エラー: ' + error.message }] };
    }
  }

  revalidatePath('/admin/children');
  return { inserted: rowsToInsert.length, errors };
};
