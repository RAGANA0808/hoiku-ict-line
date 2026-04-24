# アーキテクチャ

## 全体像

```
[保護者] ── LINE公式アカウント ─┬─ LIFF ──────────► Next.js (/liff/*)
                                  │
                                  └─ Webhook ──────► /api/line/webhook/[code]
                                                       │
[職員] ── ブラウザ ──────────────► Next.js (/admin) ◄─┤
                                                       ▼
                              +── Supabase ───────────────────────────+
                              │  Postgres + RLS (tenant_id で分離)     │
                              │  Auth (職員) / Storage / Realtime      │
                              │  Edge Functions (Webhook受信/請求生成) │
                              │  pg_cron (月次バッチ)                  │
                              +───────────────────────────────────────+
```

- **フロント/API**: Next.js 15 App Router (Vercel 推奨)
- **DB/Auth/Storage**: Supabase (Postgres + RLS)
- **LINE**: Messaging API + LIFF。**チャネルはテナント単位**
- **バックグラウンド**: Supabase Edge Functions + `pg_cron`

## マルチテナント設計

- 全業務テーブルに `tenant_id` (uuid, not null) を必須で持たせる
- Supabase RLS で `public.current_tenant_id()` を参照して tenant 分離
- 共通RLS適用は `public.apply_tenant_rls(regclass)` ヘルパーで1行
- スーパー管理者 (`role=super_admin`) は RLS を bypass

### JWT クレーム

| 利用者 | 認証方式 | `tenant_id` の出どころ |
|---|---|---|
| 職員 | Supabase Auth (メール+パスワード) | `app_metadata.tenant_id` (Auth Hook で自動付与) |
| 保護者 | LIFF 経由の LINE Login → Edge Function がカスタムJWT発行 | カスタムJWT の `tenant_id` クレーム |
| SaaS運営 | Supabase Auth + `role=super_admin` | (未使用。RLS bypass) |

## LINE チャネル設計(テナント別)

1 つのデプロイで複数園を運用するため、**LINE Messaging API チャネル / LINE Login チャネル / LIFF アプリはテナントごとに登録**します。管理画面の「設定 → LINE連携」から登録した資格情報はすべて **AES-256-GCM で暗号化して DB 保管** します (`APP_ENCRYPTION_KEY` env で復号)。

### テーブル

```
line_channels
  id, tenant_id
  webhook_path_code         -- Webhook URL の識別子 (/api/line/webhook/{code})
  messaging_channel_id
  messaging_channel_secret_enc   ← 暗号化
  messaging_access_token_enc     ← 暗号化
  login_channel_id
  login_channel_secret_enc       ← 暗号化
  is_active

line_liff_apps
  id, tenant_id, line_channel_id
  kind         -- register / messages / absence / attendance / invoice / newsletter
  liff_id
  endpoint_path

line_users
  id, tenant_id, line_channel_id
  line_user_id     -- LINEが発行するユーザー識別子 (チャネル単位でユニーク)
  guardian_id
  ...
```

### Webhook ルーティング

```
POST /api/line/webhook/[code]
  1. line_channels を webhook_path_code で検索
  2. messaging_channel_secret_enc を復号して HMAC-SHA256 署名検証
  3. event.destination と messaging_channel_id の一致確認
  4. events を処理 (follow / unfollow / message / postback)
```

`code` はテナント固有のランダム文字列(不可逆な slug)。URL を知っていても他のセキュリティ層を通過する必要があるため、チャネルシークレット署名検証が最終防衛線。

### プロバイダー構成に関する制約

- **Messaging API チャネルと LINE Login チャネルは同じプロバイダー配下に作ること**。プロバイダー単位で LINE userId が一貫するため、LIFF で取得した userId と Webhook で届く userId を突き合わせるにはこの制約が必要。

## 認証フロー

### 職員
1. `/login` で Supabase Auth (メール+パスワード) にサインイン
2. Auth Hook が `staff_users.tenant_id` を参照して `app_metadata.tenant_id` をセット
3. 以降の `/admin` リクエストで RLS が tenant_id を強制

### 保護者 (LINE 経由)
1. 園が `/admin/invites` で招待コードを発行 (8文字、7日期限、使い捨て)
2. 園が保護者に LINE 公式アカウントへの友だち追加 + 登録LIFFのリンクを渡す
3. 保護者が LIFF を開き LINE Login → line_user_id 取得
4. LIFF 内で招待コード入力 → Route Handler が検証 → `line_users` と `guardians` を紐付け
5. Edge Function がカスタム Supabase JWT (`tenant_id`, `guardian_id`, `role=guardian`) を発行
6. 以降、保護者LIFFはこのJWTでSupabaseに直接アクセス可

## 暗号化 (`packages/lib/crypto.ts`)

- AES-256-GCM / IV 12バイト / 認証タグ 16バイト
- フォーマット: `base64(iv || tag || ciphertext)`
- キーは `APP_ENCRYPTION_KEY` (32バイト base64)
- 対象: LINEチャネルシークレット、アクセストークン、LINE Login シークレット
- キーローテーション: 将来 `APP_ENCRYPTION_KEYS` (id=1 は current、id=0 は previous) のようなマルチキー対応に拡張可

## ディレクトリ別の責務

| ディレクトリ | 責務 |
|---|---|
| `apps/web/app/admin` | 職員管理画面 (React Server Components 中心) |
| `apps/web/app/liff` | 保護者 LIFF 画面 (クライアントコンポーネント主体) |
| `apps/web/app/super-admin` | SaaS 運営画面 |
| `apps/web/app/api/line/webhook/[code]` | テナント別 LINE Webhook |
| `apps/web/app/api/...` | その他副作用のあるエンドポイント |
| `packages/db` | drizzle スキーマ / `createDb(url)` クライアント |
| `packages/line` | LINE Webhook 署名検証 / Messaging API 送信ヘルパー |
| `packages/lib` | ID 生成 / AES-GCM 暗号化 / テナント型 |
| `supabase/functions` | LINE Webhook 受信(代替) / 月次請求生成 |

## OSS として配布する上での前提

- デプロイ経路は **Vercel + Supabase Cloud** を第一推奨
- 自前ホスト派のために **Docker Compose (Postgres + Next.js)** 手順も提供予定
- LINE チャネル資格情報は環境変数に**置かない**(暗号化DB保管)
- `APP_ENCRYPTION_KEY` だけが本当に秘匿必要な環境変数
- 初回セットアップは管理画面のウィザードで誘導 (Phase 1 実装予定)
