# Contributing to hoiku-ict

ご関心ありがとうございます。このプロジェクトはLINE公式アカウントを介した保育ICTをOSSとして提供することを目指しています。

## Issue / 議論

- バグ報告・機能提案は GitHub Issues へ
- 大きな設計変更は Issue で先に議論してからPRをお願いします

## 開発環境

- Node.js 22+
- pnpm 10+
- Supabase CLI (ローカルDB用、任意)

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# APP_ENCRYPTION_KEY を生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# .env.local に貼り付け

pnpm typecheck
pnpm test
pnpm build
```

## PR のガイドライン

- ブランチ名: `feat/xxx` `fix/xxx` `docs/xxx` `refactor/xxx`
- コミットメッセージは日本語・英語どちらでも可
- 以下が通ることを確認してからPRを出してください:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm lint`
  - `pnpm build`
- UIの変更は動作確認のスクリーンショットを添えてください
- DBスキーマ変更には `supabase/migrations/` への新規マイグレーションファイル追加が必要です

## 個人情報・子どもの写真の取り扱い

このソフトウェアは子どもに関わるセンシティブなデータを扱います。貢献いただく際は以下を遵守してください:

- サンプルデータ・テストデータに実在する子ども・保護者・職員の情報を含めないこと
- スクリーンショット・ログに実名・顔写真・連絡先などを含めないこと
- セキュリティ上の問題を見つけた場合は Issue でなく `security@sendan-example.jp` (後日整備) へ非公開で連絡すること

## ライセンス

貢献された内容は MIT License で公開されます。
