-- organizations: the portal owner (an events organization or a city
-- marketing organization). `package_type` is the core switch that decides
-- which functionality and fields the UI shows for this tenant.
-- Rollback: supabase/migrations_down/20260910000002_organizations.sql

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  package_type text not null check (package_type in ('a', 'b', 'c')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is
  'Portal-owning tenant. package_type: a = evenementen, b = standaard, c = citymarketing.';

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

alter table public.organizations enable row level security;

-- Policies are added in 20260910000003_organization_members.sql, once the
-- helper function that resolves "the caller's organization" exists.
