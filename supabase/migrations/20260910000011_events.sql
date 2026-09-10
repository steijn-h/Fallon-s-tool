-- events: events a profile can be linked to.
-- Rollback: supabase/migrations_down/20260910000011_events.sql

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  location text,
  start_date date,
  end_date date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_organization_id_idx on public.events (organization_id);
create index events_start_date_idx on public.events (start_date);

create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

alter table public.events enable row level security;

create policy events_select
  on public.events for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy events_insert
  on public.events for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy events_update
  on public.events for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
