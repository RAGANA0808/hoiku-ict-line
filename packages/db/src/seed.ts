import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です。');
  console.error('apps/web/.env.local に設定してください。');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TENANT_CODE = 'sendan';
const TENANT_NAME = '認定こども園せんだん幼稚園';

const FISCAL_YEAR = new Date().getFullYear();

type Tenant = { id: string; code: string; name: string };

const upsertTenant = async (): Promise<Tenant> => {
  const { data: existing } = await supabase
    .from('tenants')
    .select('id, code, name')
    .eq('code', TENANT_CODE)
    .maybeSingle();
  if (existing) return existing as Tenant;

  const { data, error } = await supabase
    .from('tenants')
    .insert({ code: TENANT_CODE, name: TENANT_NAME, plan: 'free' })
    .select('id, code, name')
    .single();
  if (error) throw error;
  return data as Tenant;
};

const seedClasses = async (tenantId: string) => {
  const rows = [
    { fiscal_year: FISCAL_YEAR, name: 'さくら組', age_group: '5歳児' },
    { fiscal_year: FISCAL_YEAR, name: 'ひまわり組', age_group: '4歳児' },
    { fiscal_year: FISCAL_YEAR, name: 'すみれ組', age_group: '3歳児' },
  ];
  for (const r of rows) {
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('fiscal_year', r.fiscal_year)
      .eq('name', r.name)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('classes').insert({ ...r, tenant_id: tenantId });
    if (error) throw error;
  }
};

const seedChildren = async (tenantId: string) => {
  const rows = [
    {
      family_name: '山田',
      given_name: '太郎',
      family_name_kana: 'ヤマダ',
      given_name_kana: 'タロウ',
      birth_date: '2020-04-15',
      enrolled_on: '2024-04-01',
      photo_consent: true,
    },
    {
      family_name: '佐藤',
      given_name: '花子',
      family_name_kana: 'サトウ',
      given_name_kana: 'ハナコ',
      birth_date: '2021-06-01',
      enrolled_on: '2024-04-01',
      photo_consent: false,
    },
    {
      family_name: '鈴木',
      given_name: '一郎',
      family_name_kana: 'スズキ',
      given_name_kana: 'イチロウ',
      birth_date: '2022-09-10',
      enrolled_on: '2025-04-01',
      photo_consent: true,
    },
  ];
  for (const r of rows) {
    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('family_name', r.family_name)
      .eq('given_name', r.given_name)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('children').insert({ ...r, tenant_id: tenantId });
    if (error) throw error;
  }
};

const main = async () => {
  console.log('🌱 Seeding...');
  const tenant = await upsertTenant();
  console.log(`  テナント: ${tenant.name} (${tenant.id})`);

  await seedClasses(tenant.id);
  console.log('  クラス投入完了');

  await seedChildren(tenant.id);
  console.log('  園児投入完了');

  console.log('✅ Done');
};

main().catch((err: Error) => {
  console.error('❌ Seed失敗:', err.message);
  process.exit(1);
});
