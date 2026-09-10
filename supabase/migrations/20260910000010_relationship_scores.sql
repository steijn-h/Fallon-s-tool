-- relationship_scores: an append-only history of score entries per profile.
-- The "current score" is simply the most recent row for a given
-- (profile_id, score_type) — there is no separate mutable "current value"
-- column, so adjusting a score always means adding a new entry and the full
-- history is never lost.
--
-- score_type already allows 'city' and 'sponsor' in addition to today's only
-- used value, 'relationship'. Future stadsscore/sponsorscore calculations
-- (out of scope for this phase) can write into this same table without a
-- schema change.
-- Rollback: supabase/migrations_down/20260910000010_relationship_scores.sql

create table public.relationship_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  score_type text not null default 'relationship' check (score_type in ('relationship', 'city', 'sponsor')),
  score numeric(5, 2) not null,
  note text,
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now()
);

create index relationship_scores_organization_id_idx
  on public.relationship_scores (organization_id);
create index relationship_scores_profile_id_recorded_at_idx
  on public.relationship_scores (profile_id, recorded_at desc);

create trigger relationship_scores_sync_org
  before insert on public.relationship_scores
  for each row
  execute function public.sync_organization_id_from_profile();

alter table public.relationship_scores enable row level security;

create policy relationship_scores_select
  on public.relationship_scores for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy relationship_scores_insert
  on public.relationship_scores for insert
  to authenticated
  with check (organization_id = public.current_organization_id());
