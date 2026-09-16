-- SponsorHub is single-club: every logged-in staff account has equal, full
-- access (no per-organization isolation, no roles) — RLS below just closes
-- every table to unauthenticated (anon) access.
--
-- owners: a lightweight, freely editable list of staff names to assign
-- prospects/sponsorships to. Deliberately NOT tied 1:1 to auth.users — an
-- "owner" is a display label for reporting/assignment, not a login account.
--
-- pipeline_stages: text ids (readable, referenced directly by prospects and
-- by the seeded DEFAULT_PIPELINE_STAGES) rather than uuids.
-- Rollback: supabase/migrations_down/20260916000020_owners_and_pipeline_stages.sql

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.owners enable row level security;

create policy owners_all
  on public.owners for all
  to authenticated
  using (true)
  with check (true);

create table public.pipeline_stages (
  id text primary key,
  label text not null,
  color text not null,
  type text not null check (type in ('open', 'won', 'lost')),
  sort_order integer not null,
  created_at timestamptz not null default now()
);

alter table public.pipeline_stages enable row level security;

create policy pipeline_stages_all
  on public.pipeline_stages for all
  to authenticated
  using (true)
  with check (true);

-- Default pipeline: the app needs these to exist for the Acquisitie-kanban
-- to have columns at all. This is app configuration, not demo business
-- data, so it lives in the migration rather than a separate seed script.
insert into public.pipeline_stages (id, label, color, type, sort_order) values
  ('lead', 'Lead', '275 45% 62%', 'open', 0),
  ('prospect', 'Prospect', '271 50% 55%', 'open', 1),
  ('mql', 'MQL', '271 60% 48%', 'open', 2),
  ('sql', 'SQL', '25 90% 55%', 'open', 3),
  ('sponsor', 'Afspraak sponsor', '152 56% 42%', 'won', 4),
  ('geen-interesse', 'Geen interesse', '0 72% 51%', 'lost', 5);
