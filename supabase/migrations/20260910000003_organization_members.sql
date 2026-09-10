-- organization_members: links an auth.users row to exactly one organization,
-- with a role used for RLS and in-app authorization checks.
-- Rollback: supabase/migrations_down/20260910000003_organization_members.sql

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

-- Resolves the calling user's organization. SECURITY DEFINER + a search_path
-- pinned to public lets this function read organization_members without
-- re-triggering that table's own RLS policy (which would otherwise recurse).
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

revoke all on function public.current_organization_id() from public;
revoke all on function public.current_role() from public;
revoke all on function public.is_admin_or_owner() from public;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin_or_owner() to authenticated;

alter table public.organization_members enable row level security;

create policy organization_members_select_own_org
  on public.organization_members for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy organization_members_insert_admin
  on public.organization_members for insert
  to authenticated
  with check (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  );

create policy organization_members_update_admin
  on public.organization_members for update
  to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  )
  with check (organization_id = public.current_organization_id());

create policy organization_members_delete_admin
  on public.organization_members for delete
  to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  );

-- Now that current_organization_id() exists, add the organizations policies.
create policy organizations_select_own
  on public.organizations for select
  to authenticated
  using (id = public.current_organization_id());

create policy organizations_update_owner
  on public.organizations for update
  to authenticated
  using (id = public.current_organization_id() and public.current_role() = 'owner')
  with check (id = public.current_organization_id());
