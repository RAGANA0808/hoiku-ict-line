-- 保育ICT マスタテーブル (staff, children, classes, guardians, line)

-- ========================================================================
-- staff_users
-- ========================================================================
create table public.staff_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid not null,
  email text not null,
  display_name text not null,
  role text not null check (role in ('admin', 'teacher', 'office')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index staff_users_auth_user_unique on public.staff_users (auth_user_id);
create unique index staff_users_tenant_email_unique on public.staff_users (tenant_id, email);
select public.apply_tenant_rls('public.staff_users');

-- ========================================================================
-- children
-- ========================================================================
create table public.children (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  family_name text not null,
  given_name text not null,
  family_name_kana text,
  given_name_kana text,
  birth_date date not null,
  enrolled_on date not null,
  withdrew_on date,
  photo_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index children_tenant_idx on public.children (tenant_id);
select public.apply_tenant_rls('public.children');

-- ========================================================================
-- classes
-- ========================================================================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fiscal_year integer not null,
  name text not null,
  age_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index classes_tenant_year_idx on public.classes (tenant_id, fiscal_year);
select public.apply_tenant_rls('public.classes');

-- ========================================================================
-- class_enrollments
-- ========================================================================
create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index class_enrollments_tenant_idx on public.class_enrollments (tenant_id);
create index class_enrollments_class_idx on public.class_enrollments (class_id);
select public.apply_tenant_rls('public.class_enrollments');

-- ========================================================================
-- guardians
-- ========================================================================
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  family_name text not null,
  given_name text not null,
  relation text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index guardians_tenant_idx on public.guardians (tenant_id);
select public.apply_tenant_rls('public.guardians');

-- ========================================================================
-- guardian_child_links
-- ========================================================================
create table public.guardian_child_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index guardian_child_links_tenant_idx on public.guardian_child_links (tenant_id);
create index guardian_child_links_guardian_idx on public.guardian_child_links (guardian_id);
create index guardian_child_links_child_idx on public.guardian_child_links (child_id);
select public.apply_tenant_rls('public.guardian_child_links');

-- ========================================================================
-- line_users
-- ========================================================================
create table public.line_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
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
create unique index line_users_tenant_line_unique on public.line_users (tenant_id, line_user_id);
create index line_users_guardian_idx on public.line_users (guardian_id);
select public.apply_tenant_rls('public.line_users');

-- ========================================================================
-- guardian_invite_codes
-- ========================================================================
create table public.guardian_invite_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index guardian_invite_codes_tenant_code_unique on public.guardian_invite_codes (tenant_id, code);
select public.apply_tenant_rls('public.guardian_invite_codes');
