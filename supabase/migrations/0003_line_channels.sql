-- テナント単位のLINEチャネル/LIFF管理 と line_users スキーマ修正
-- 初期リリース前のマイグレーション前提で、0002 の line_users を差し替え

-- 依存する line_users と guardian_invite_codes の古い定義を削除
-- (初期開発段階のため data loss 許容)
drop table if exists public.line_users cascade;

-- ========================================================================
-- line_channels
-- ========================================================================
create table public.line_channels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  webhook_path_code text not null,
  messaging_channel_id text not null,
  messaging_channel_secret_enc text not null,
  messaging_access_token_enc text not null,
  login_channel_id text,
  login_channel_secret_enc text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index line_channels_tenant_idx on public.line_channels (tenant_id);
create unique index line_channels_webhook_path_unique on public.line_channels (webhook_path_code);
select public.apply_tenant_rls('public.line_channels');

-- ========================================================================
-- line_liff_apps
-- ========================================================================
create table public.line_liff_apps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  line_channel_id uuid not null references public.line_channels(id) on delete cascade,
  kind text not null check (
    kind in ('register', 'messages', 'absence', 'attendance', 'invoice', 'newsletter')
  ),
  liff_id text not null,
  endpoint_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index line_liff_apps_tenant_idx on public.line_liff_apps (tenant_id);
create unique index line_liff_apps_channel_kind_unique on public.line_liff_apps (line_channel_id, kind);
select public.apply_tenant_rls('public.line_liff_apps');

-- ========================================================================
-- line_users (再作成。line_channel_id を追加)
-- ========================================================================
create table public.line_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  line_channel_id uuid not null references public.line_channels(id) on delete cascade,
  line_user_id text not null,
  guardian_id uuid references public.guardians(id) on delete set null,
  display_name text,
  picture_url text,
  followed_at timestamptz,
  unfollowed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index line_users_channel_line_unique on public.line_users (line_channel_id, line_user_id);
create index line_users_guardian_idx on public.line_users (guardian_id);
select public.apply_tenant_rls('public.line_users');
