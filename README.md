# hoiku-ict

LINE公式アカウントを保護者の入口とする、オープンソースの保育ICT(園児管理・連絡帳・登降園・請求)。
認定こども園せんだん幼稚園での自社開発を起点に、他の園でも自ホストで使えるよう MIT ライセンスで公開しています。

> **Status**: Phase 0 / 1 相当、鋭意開発中。本番運用はまだ推奨しません。

## 特徴

- 保護者は **自園の LINE 公式アカウント** を友だち追加するだけで使える (LIFF + Messaging API)
- 職員は Next.js の管理画面で園児・保護者・登降園・連絡帳・請求を一元管理
- **マルチテナント設計**: 1 つのデプロイで複数園を運用可能 (Supabase RLS)
- 園ごとに LINE チャネルを分離 (チャネルシークレット・アクセストークンは AES-256-GCM で暗号化して DB 保管)
- Vercel + Supabase 無料枠で立ち上げ可能 (本番規模で有料枠移行)

## 機能 (実装状況)

| 機能 | 状態 |
|---|---|
| テナント・職員・園児・クラス・保護者マスタ | 🔨 Phase 1 実装中 |
| 招待コードによる保護者 LINE 紐付け | 🔨 Phase 1 |
| 登降園管理・欠席連絡 | ⏳ Phase 2 |
| 連絡帳・おたより | ⏳ Phase 3 |
| 請求・全銀CSV | ⏳ Phase 4 |
| SaaS 運営ダッシュボード | ⏳ Phase 5 |

## アーキテクチャ

```
[保護者] ── LINE公式アカウント ─┬─ LIFF ──► Next.js /liff
                                  │
                                  └─ Webhook ──► /api/line/webhook/[tenantCode]
                                                    │
[職員] ── ブラウザ ─────────────► Next.js /admin ◄─┤
                                                    ▼
                                           Supabase (Postgres + RLS)
```

- フロント/API: Next.js 15 App Router
- DB/Auth/Storage: Supabase (または自前 Postgres + Supabase 互換認証)
- LINE: Messaging API + LIFF、チャネルはテナント単位
- バックグラウンド: Supabase Edge Functions + pg_cron

詳細は [docs/architecture.md](./docs/architecture.md) を参照。

## クイックスタート

### 必要なもの

- Node.js 22+ / pnpm 10+
- Supabase プロジェクト (無料枠で OK)
- LINE 公式アカウント
  - Messaging API チャネル (保育ICT用)
  - LINE Login チャネル (LIFF用)
  - 両チャネルは **同一プロバイダー** の配下に作成してください

### セットアップ

```bash
git clone https://github.com/RAGANA0808/hoiku-ict-line.git
cd hoiku-ict
pnpm install

cp apps/web/.env.example apps/web/.env.local
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 出力を APP_ENCRYPTION_KEY として .env.local に貼り付け

# Supabase プロジェクトの URL / anon key / service_role key / DATABASE_URL を貼り付け

# マイグレーション適用 (Supabase SQL Editor、または CLI)
pnpm db:push

# 開発サーバー
pnpm dev
# http://localhost:3000
```

### LINE 資格情報の登録

LINE チャネルのシークレット・アクセストークン・LIFF ID は **管理画面の「設定 → LINE連携」** から登録します (環境変数ではなくDBに暗号化保管)。Phase 1 ではシード経由で投入。

詳細手順は [docs/onboarding.md](./docs/onboarding.md) を参照。

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー |
| `pnpm build` | 本番ビルド |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | 単体テスト |
| `pnpm lint` | Lint |
| `pnpm db:generate` | drizzle マイグレーション生成 |
| `pnpm db:migrate` | マイグレーション適用 |

## ディレクトリ

```
apps/web/              Next.js アプリ (管理画面/LIFF/SaaS運営)
packages/db/           drizzle-orm スキーマ・クライアント
packages/line/         LINE SDK ラッパ (署名検証・送信ヘルパー)
packages/lib/          共通ユーティリティ (ID 生成・AES-GCM 暗号化など)
packages/ui/           共通 UI コンポーネント
supabase/migrations/   Postgres マイグレーション (RLS 込み)
supabase/functions/    Edge Functions (LINE Webhook / 請求生成)
docs/                  設計・運用ドキュメント
```

## コントリビュート

歓迎します。[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。
子どもの情報を扱うソフトウェアのため、プライバシー・セキュリティ面の議論は特に慎重にお願いします。

## ライセンス

[MIT License](./LICENSE) - Copyright (c) 2026 認定こども園せんだん幼稚園 / hoiku-ict contributors
