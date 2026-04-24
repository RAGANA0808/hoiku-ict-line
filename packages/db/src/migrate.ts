import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MIGRATIONS_DIR = resolve(__dirname, '../../../supabase/migrations');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL が設定されていません。apps/web/.env.local を確認してください。');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });

const ensureMigrationTable = async () => {
  await sql`
    create table if not exists public._hoiku_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `;
};

const listApplied = async (): Promise<Set<string>> => {
  const rows = await sql<{ filename: string }[]>`select filename from public._hoiku_migrations`;
  return new Set(rows.map((r) => r.filename));
};

const main = async () => {
  console.log('🔌 DB 接続確認中...');
  const rows = await sql<{ now: string }[]>`select now()::text as now`;
  console.log(`  サーバー時刻: ${rows[0]?.now ?? 'unknown'}`);

  await ensureMigrationTable();
  const applied = await listApplied();

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  console.log(`📦 マイグレーション: ${files.length} ファイル発見`);

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭  ${file} (適用済み)`);
      continue;
    }
    console.log(`  ▶  ${file} 実行中...`);
    const content = await readFile(resolve(MIGRATIONS_DIR, file), 'utf8');
    try {
      await sql.unsafe(content);
      await sql`insert into public._hoiku_migrations (filename) values (${file})`;
      console.log(`  ✅ ${file}`);
    } catch (err) {
      console.error(`  ❌ ${file} 失敗:`, (err as Error).message);
      throw err;
    }
  }

  console.log('✅ マイグレーション完了');
};

main()
  .catch((err: Error) => {
    console.error('❌ 失敗:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
