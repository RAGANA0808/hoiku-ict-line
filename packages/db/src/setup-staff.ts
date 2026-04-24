import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です。');
  process.exit(1);
}

const [authUserId, tenantCodeArg, roleArg, displayNameArg] = process.argv.slice(2);

if (!authUserId) {
  console.error('使い方: tsx src/setup-staff.ts <auth_user_id> [tenant_code=sendan] [role=admin] [display_name=管理者]');
  process.exit(1);
}

const tenantCode = tenantCodeArg ?? 'sendan';
const role = (roleArg ?? 'admin') as 'admin' | 'teacher' | 'office';
const displayName = displayNameArg ?? '管理者';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const main = async () => {
  console.log(`🔎 テナント "${tenantCode}" を検索...`);
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, code, name')
    .eq('code', tenantCode)
    .single();
  if (tenantErr || !tenant) {
    throw new Error(`テナント "${tenantCode}" が見つかりません。先に seed を実行してください。`);
  }
  console.log(`  ${tenant.name} (${tenant.id})`);

  console.log(`🔎 Supabase Auth ユーザー ${authUserId} を取得...`);
  const { data: userRes, error: userErr } = await supabase.auth.admin.getUserById(authUserId);
  if (userErr || !userRes.user) {
    throw new Error(`Auth ユーザーが見つかりません: ${userErr?.message ?? 'not found'}`);
  }
  const user = userRes.user;
  console.log(`  ${user.email}`);

  console.log(`🔐 app_metadata を更新 (tenant_id, role)...`);
  const { error: metaErr } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      tenant_id: tenant.id,
      role,
    },
  });
  if (metaErr) throw metaErr;
  console.log('  ✅ app_metadata 更新');

  console.log('📝 staff_users に登録...');
  const { data: existing } = await supabase
    .from('staff_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('staff_users')
      .update({
        tenant_id: tenant.id,
        email: user.email ?? '',
        display_name: displayName,
        role,
      })
      .eq('id', existing.id);
    if (error) throw error;
    console.log('  ✅ 既存レコードを更新');
  } else {
    const { error } = await supabase.from('staff_users').insert({
      tenant_id: tenant.id,
      auth_user_id: user.id,
      email: user.email ?? '',
      display_name: displayName,
      role,
    });
    if (error) throw error;
    console.log('  ✅ 新規レコードを作成');
  }

  console.log('\n🎉 セットアップ完了');
  console.log(`   ブラウザで http://localhost:3000/login を開き、${user.email} でログインしてください。`);
};

main().catch((err: Error) => {
  console.error('❌ 失敗:', err.message);
  process.exit(1);
});
