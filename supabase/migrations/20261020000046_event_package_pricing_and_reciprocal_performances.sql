-- "Evenementen" wordt een eigen onderdeel: jaargebonden pakketprijzen met
-- terugwerkende kracht, kostprijs, en wederkerige prestaties (wat de club
-- in ruil voor sponsoring levert) met hun benodigde handelingen en een
-- waargenomen waarde per prestatie.
-- Rollback: supabase/migrations_down/20261020000046_event_package_pricing_and_reciprocal_performances.sql

create table public.event_package_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  event_package_id uuid not null references public.event_packages (id) on delete cascade,
  year integer not null,
  value numeric(12, 2) not null default 0,
  cost_price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (event_package_id, year)
);

create index event_package_prices_event_package_id_idx on public.event_package_prices (event_package_id);
create index event_package_prices_organization_id_idx on public.event_package_prices (organization_id);

alter table public.event_package_prices enable row level security;

create policy event_package_prices_all
  on public.event_package_prices for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

create table public.reciprocal_performances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  event_package_id uuid not null references public.event_packages (id) on delete cascade,
  title text not null,
  description text,
  perceived_value numeric(12, 2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index reciprocal_performances_event_package_id_idx on public.reciprocal_performances (event_package_id);
create index reciprocal_performances_organization_id_idx on public.reciprocal_performances (organization_id);

alter table public.reciprocal_performances enable row level security;

create policy reciprocal_performances_all
  on public.reciprocal_performances for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

create table public.reciprocal_performance_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  reciprocal_performance_id uuid not null references public.reciprocal_performances (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index reciprocal_performance_actions_performance_id_idx
  on public.reciprocal_performance_actions (reciprocal_performance_id);
create index reciprocal_performance_actions_organization_id_idx
  on public.reciprocal_performance_actions (organization_id);

alter table public.reciprocal_performance_actions enable row level security;

create policy reciprocal_performance_actions_all
  on public.reciprocal_performance_actions for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
