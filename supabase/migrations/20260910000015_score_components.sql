-- score_components: the calculated sub-score per profile, per criterion,
-- per calculation run. Append-only (like relationship_scores and notes) —
-- a recalculation writes new rows, it never overwrites old ones, so a
-- profile's score history stays fully auditable. `run_id` groups every
-- component written by one calculation together with the matching total
-- row in relationship_scores (see 20260910000016).
-- Rollback: supabase/migrations_down/20260910000015_score_components.sql

create table public.score_components (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  criterion_key text not null,
  run_id uuid not null,
  value numeric(5, 2) not null,
  weight_applied numeric(5, 2) not null,
  explanation text not null,
  computed_at timestamptz not null default now(),
  foreign key (organization_id, criterion_key) references public.score_criteria (organization_id, key)
);

comment on table public.score_components is
  'One row per criterion per calculation run. weight_applied snapshots the weight used at that time, so historic components stay meaningful even if a weight is changed later.';

create index score_components_organization_id_idx on public.score_components (organization_id);
create index score_components_profile_id_computed_at_idx
  on public.score_components (profile_id, computed_at desc);
create index score_components_run_id_idx on public.score_components (run_id);

create trigger score_components_sync_org
  before insert on public.score_components
  for each row
  execute function public.sync_organization_id_from_profile();

alter table public.score_components enable row level security;

create policy score_components_select
  on public.score_components for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy score_components_insert
  on public.score_components for insert
  to authenticated
  with check (organization_id = public.current_organization_id());
