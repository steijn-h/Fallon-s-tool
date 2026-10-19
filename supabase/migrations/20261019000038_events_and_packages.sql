-- events: a first-class entity (e.g. "Schaatsbaan", "Koningsdag") — each
-- event has its own, independent set of sponsor packages, instead of one
-- global tier list shared across everything an organization sponsors.
-- event_packages: the packages that hang under one event (replaces the old
-- global sponsorships.tier enum — see 20261019000039).
-- Rollback: supabase/migrations_down/20261019000038_events_and_packages.sql

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_organization_id_idx on public.events (organization_id);

create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

alter table public.events enable row level security;

create policy events_all
  on public.events for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

create table public.event_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  color text not null default '25 95% 53%',
  value numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index event_packages_event_id_idx on public.event_packages (event_id);
create index event_packages_organization_id_idx on public.event_packages (organization_id);

alter table public.event_packages enable row level security;

create policy event_packages_all
  on public.event_packages for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
