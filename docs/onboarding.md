# オンボーディング

自園で hoiku-ict を立ち上げる手順。所要時間の目安は **30〜60分**(LINE設定を含む)。

## 1. 事前準備

- GitHub アカウント
- Vercel アカウント (無料枠で可)
- Supabase アカウント (無料枠で可)
- LINE ビジネスID (法人/園として作成)

## 2. リポジトリを fork

```
https://github.com/<your-org>/hoiku-ict
```

自園のGitHub organizationに fork するか、clone してください。

## 3. Supabase プロジェクト作成

1. https://supabase.com/dashboard で New project
2. Region は Asia (Tokyo ap-northeast-1) 推奨
3. DB password は強めに設定
4. 作成後、以下の値を控える
   - Project URL
   - `anon public` key
   - `service_role` key (秘匿)
   - Database → Connection string → URI (`postgresql://...`)

## 4. マイグレーション適用

Supabase SQL Editor で以下を順に実行:
1. `supabase/migrations/0001_init_tenants_and_rls.sql`
2. `supabase/migrations/0002_master_tables.sql`
3. `supabase/migrations/0003_line_channels.sql`

または Supabase CLI で:

```bash
supabase link --project-ref <REF>
supabase db push
```

## 5. 環境変数

ローカル開発:

```bash
cp apps/web/.env.example apps/web/.env.local
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 出力を APP_ENCRYPTION_KEY に貼り付け

# Supabase の値も貼り付け
```

Vercel デプロイ時は同じ環境変数を Vercel Project Settings → Environment Variables に入れる。

> **重要**: `APP_ENCRYPTION_KEY` は一度本番投入したら**絶対に変えない**(変えると既存の暗号化データが復号できなくなる)。失うとLINE資格情報が全滅するので、パスワードマネージャ等に厳重保管する。

## 6. 初期テナント投入

SQL Editor で:

```sql
insert into public.tenants (code, name) values ('sendan', '認定こども園せんだん幼稚園');
```

## 7. 最初の職員アカウント作成

Supabase Dashboard → Authentication → Users → Add user で管理者のメール+パスワードを登録した後、SQL Editor で:

```sql
insert into public.staff_users (tenant_id, auth_user_id, email, display_name, role)
values (
  (select id from public.tenants where code = 'sendan'),
  '<AUTH_USER_ID_FROM_DASHBOARD>',
  'admin@example.jp',
  '管理者',
  'admin'
);
```

Phase 1 以降は、管理画面のウィザードからこの手順をUI化します。

## 8. LINE 公式アカウント・LIFF 設定

### 8.1 プロバイダー作成
LINE Developers Console → Provider → Create
- プロバイダー名: `認定こども園せんだん幼稚園`

### 8.2 Messaging API チャネル作成
Providers → + Create → Messaging API
- チャネル名: `保育ICT`
- 以下を控える
  - Channel ID
  - Channel secret
  - Channel access token (issue してから控える)

### 8.3 LINE Login チャネル作成 (同じプロバイダー配下)
Providers → + Create → LINE Login
- チャネル名: `保育ICT Login`
- 以下を控える
  - Channel ID
  - Channel secret

### 8.4 LIFF アプリ追加
LINE Login チャネル → LIFF → Add で以下を作成:

| 名前 | エンドポイントURL | サイズ |
|---|---|---|
| 保育ICT 登録 | `https://<your-domain>/liff/register?code=<CHANNEL_CODE>` | Full |
| 保育ICT 連絡帳 | `https://<your-domain>/liff/messages?code=<CHANNEL_CODE>` | Full |
| 保育ICT 欠席連絡 | `https://<your-domain>/liff/absence?code=<CHANNEL_CODE>` | Full |
| 保育ICT 登降園 | `https://<your-domain>/liff/attendance?code=<CHANNEL_CODE>` | Full |
| 保育ICT 請求 | `https://<your-domain>/liff/invoice?code=<CHANNEL_CODE>` | Full |

各 LIFF ID を控える。

### 8.5 Webhook URL 設定 (Messaging API)
Webhook URL: `https://<your-domain>/api/line/webhook/<CHANNEL_CODE>`
- `<CHANNEL_CODE>` は hoiku-ict が発行する slug (Phase 2 でUI化)
- Verify ボタンで疎通確認

### 8.6 管理画面から登録
/admin/settings/line-channels で以下を入力(Phase 2 でUI化):
- Messaging チャネルID / シークレット / アクセストークン
- Login チャネルID / シークレット
- 各LIFFの kind と liff_id

保存時にシークレット類が AES-256-GCM で暗号化されます。

## 9. 動作確認

```bash
pnpm dev
```

- http://localhost:3000/ → トップ
- http://localhost:3000/admin → ログイン後ダッシュボード
- http://localhost:3000/api/health → `{"status":"ok"}`

## 10. Vercel デプロイ

```bash
vercel
# GitHub リポジトリと連携、環境変数設定
```

本番URLが決まったら LINE Developers Console の各LIFFとWebhookのURLを更新すること。
