-- Reintroduces multi-tenancy, which the SponsorHub pivot (20260916000019)
-- deliberately removed. SponsorHub now becomes the per-organization portal;
-- this migration adds the organization/licensing layer back underneath it.
--
-- organizations: a licensed tenant. package_type is the switch that will
-- gate feature depth in later phases (a/b/c keep their original meaning for
-- now: a = evenementen, b = standaard, c = citymarketing — subject to
-- revisiting once the event/package rework lands).
--
-- organization_members: links an auth.users row to exactly one organization
-- (user_id is UNIQUE), with a role for in-app authorization.
--
-- platform_admins: the operator's own allowlist (not exposed via any RLS
-- policy — default-deny, only reachable as postgres/service-role). This is
-- the "owner of the whole platform" seat, distinct from an organization's
-- own owner/admin/member roles.
--
-- Rollback: supabase/migrations_down/20261017000027_organizations_and_members.sql

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  package_type text not null check (package_type in ('a', 'b', 'c')) default 'b',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is
  'Licensed tenant. package_type: a = evenementen, b = standaard, c = citymarketing.';

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now()
);

comment on table public.organization_members is
  'One row per portal user. user_id is UNIQUE: a user belongs to exactly one organization.';

create index organization_members_organization_id_idx
  on public.organization_members (organization_id);

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.platform_admins is
  'Explicit allowlist for the platform operator — sees/manages every organization. '
  'Default-deny: no RLS policy grants API access to this table at all.';

-- SECURITY DEFINER + a pinned search_path lets these read organization_members /
-- platform_admins without re-triggering those tables' own RLS (which would
-- otherwise recurse).
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.organization_members
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('owner', 'admin'), false);
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.current_organization_id() from public;
revoke all on function public.current_role() from public;
revoke all on function public.is_admin_or_owner() from public;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin_or_owner() to authenticated;
grant execute on function public.is_platform_admin() to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.platform_admins enable row level security;
-- platform_admins gets no policies at all: default-deny for every API role.

-- Only the platform operator creates/edits organizations and assigns
-- package_type — that is the "licentie geven" action. An organization's own
-- members can see their own organization, nothing more.
create policy organizations_select_own
  on public.organizations for select
  to authenticated
  using (id = public.current_organization_id() or public.is_platform_admin());

create policy organizations_insert_platform_admin
  on public.organizations for insert
  to authenticated
  with check (public.is_platform_admin());

create policy organizations_update_platform_admin
  on public.organizations for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy organizations_delete_platform_admin
  on public.organizations for delete
  to authenticated
  using (public.is_platform_admin());

create policy organization_members_select_own_org
  on public.organization_members for select
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin());

create policy organization_members_insert_admin
  on public.organization_members for insert
  to authenticated
  with check (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  );

create policy organization_members_update_admin
  on public.organization_members for update
  to authenticated
  using (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  )
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

create policy organization_members_delete_admin
  on public.organization_members for delete
  to authenticated
  using (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  );

-- A fixed-id "demo" organization that the next migrations backfill every
-- existing (pre-multi-tenant) row onto, so NOT NULL organization_id columns
-- can be added safely to tables that may already hold data on a live
-- project (the 2 example prospects + 1 example sponsorship, or a real
-- deployment's own data).
insert into public.organizations (id, name, package_type)
values ('00000000-0000-0000-0000-000000000001', 'Demo organisatie', 'b');
