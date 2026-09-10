-- archetypes: minimal placeholder for the future persona layer. Only the
-- relation (profile -> archetype) is established now; matching logic and
-- archetype content are explicitly out of scope for this phase.
-- Rollback: supabase/migrations_down/20260910000005_archetypes.sql

create table public.archetypes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index archetypes_organization_id_idx on public.archetypes (organization_id);

alter table public.archetypes enable row level security;

create policy archetypes_select
  on public.archetypes for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy archetypes_insert
  on public.archetypes for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy archetypes_update
  on public.archetypes for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
