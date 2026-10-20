-- financial_entries: income/expense ledger per event, distinguishing
-- direct, indirect and goodwill value — separate from sponsorships.value
-- (what a sponsor pays) and payments (when it's invoiced/collected).
-- This is the club's OWN costs and other income/expenses tied to running
-- an event, optionally linked to the specific deliverable (reciprocal
-- performance) it relates to.
-- Rollback: supabase/migrations_down/20261020000041_financial_entries.sql

create table public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  event_id uuid not null references public.events (id) on delete restrict,
  deliverable_id uuid references public.deliverables (id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  category text not null check (category in ('direct', 'indirect', 'goodwill')),
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index financial_entries_organization_id_idx on public.financial_entries (organization_id);
create index financial_entries_event_id_idx on public.financial_entries (event_id);

alter table public.financial_entries enable row level security;

create policy financial_entries_all
  on public.financial_entries for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
