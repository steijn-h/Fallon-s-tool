-- lead_sources: per-organization catalog of lead origins (e.g. "website",
-- "referral", "beurs"). profile_lead_source (later migration) links a
-- profile to one of these.
-- Rollback: supabase/migrations_down/20260910000004_lead_sources.sql

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index lead_sources_organization_id_idx on public.lead_sources (organization_id);

alter table public.lead_sources enable row level security;

create policy lead_sources_select
  on public.lead_sources for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy lead_sources_insert
  on public.lead_sources for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy lead_sources_update
  on public.lead_sources for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
