'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirect: z.string().default('/admin'),
});

export const signIn = async (formData: FormData) => {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirect: formData.get('redirect') ?? '/admin',
  });

  if (!parsed.success) {
    redirect('/login?error=' + encodeURIComponent('入力内容を確認してください'));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect('/login?error=' + encodeURIComponent('ログインに失敗しました: ' + error.message));
  }

  redirect(parsed.data.redirect);
};

export const signOut = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login?reason=signed-out');
};
