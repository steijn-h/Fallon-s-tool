-- year_targets: a single-row settings table (the `id = 1` check enforces
-- exactly one row) holding this year's targets, shown as progress bars on
-- the dashboard.
-- Rollback: supabase/migrations_down/20260916000026_year_targets.sql

create table public.year_targets (
  id smallint primary key default 1 check (id = 1),
  sponsor_count integer not null default 25,
  sponsor_amount numeric(12, 2) not null default 500000,
  renewal_rate numeric(5, 2) not null default 70,
  updated_at timestamptz not null default now()
);

insert into public.year_targets (id) values (1);

create trigger year_targets_set_updated_at
  before update on public.year_targets
  for each row
  execute function public.set_updated_at();

alter table public.year_targets enable row level security;

create policy year_targets_all
  on public.year_targets for all
  to authenticated
  using (true)
  with check (true);
