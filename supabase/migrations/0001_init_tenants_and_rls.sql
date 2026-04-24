-- 保育ICT 初期マイグレーション
-- tenants テーブル作成と、全テーブル共通のRLS基盤

create extension if not exists "pgcrypto";

-- ========================================================================
-- JWT helper: テナントID取得
-- 職員: Supabase Auth JWT の app_metadata.tenant_id
-- 保護者: Edge Functionで発行したカスタムJWTの tenant_id クレーム
-- ========================================================================
create or replace function public.current_tenant_id() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.tenant_id', true), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id'), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'), '')
  )::uuid;
$$;

create or replace function public.current_user_role() returns text
language sql stable
as $$
  select coalesce(
    nullif((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'role'), '')
  );
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable
as $$
  select public.current_user_role() = 'super_admin';
$$;

-- ========================================================================
-- tenants
-- ========================================================================
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index tenants_code_unique on public.tenants (code);

alter table public.tenants enable row level security;

create policy tenants_select on public.tenants
  for select
  using (public.is_super_admin() or id = public.current_tenant_id());

create policy tenants_update on public.tenants
  for update
  using (public.is_super_admin() or id = public.current_tenant_id())
  with check (public.is_super_admin() or id = public.current_tenant_id());

create policy tenants_insert on public.tenants
  for insert
  with check (public.is_super_admin());

create policy tenants_delete on public.tenants
  for delete
  using (public.is_super_admin());

-- ========================================================================
-- 全業務テーブル共通のRLSポリシーを貼る関数(後続マイグレーションから利用)
-- ========================================================================
create or replace function public.apply_tenant_rls(target_table regclass) returns void
language plpgsql
as $$
declare
  t_name text := target_table::text;
  pol_select text := t_name || '_tenant_select';
  pol_modify text := t_name || '_tenant_modify';
begin
  execute format('alter table %s enable row level security', target_table);

  execute format(
    'create policy %I on %s for select using (public.is_super_admin() or tenant_id = public.current_tenant_id())',
    pol_select, target_table
  );

  execute format(
    'create policy %I on %s for all using (public.is_super_admin() or tenant_id = public.current_tenant_id()) with check (public.is_super_admin() or tenant_id = public.current_tenant_id())',
    pol_modify, target_table
  );
end;
$$;

comment on function public.apply_tenant_rls(regclass) is
  '業務テーブル共通のRLSポリシーを貼るヘルパー。tenant_id = current_tenant_id() を要求する。';
