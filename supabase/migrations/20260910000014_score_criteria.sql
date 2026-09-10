-- score_criteria: configurable weighting per criterion that feeds the
-- sponsorscore (pakket b) and stadsscore (pakket c). Each organization gets
-- its own row per criterion (not one global row per package_type) so a
-- future admin screen (out of scope for this phase) can let a specific
-- organization tune its own weights without affecting others; `active`
-- lets a criterion be switched off without deleting its history-bearing
-- key. `package_type` is kept as an explicit column (matching the org's own
-- package_type, enforced by trigger below) purely for cheap filtering and
-- readability — the real scoping is organization_id, consistent with every
-- other tenant table.
-- Rollback: supabase/migrations_down/20260910000014_score_criteria.sql

create table public.score_criteria (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  package_type text not null check (package_type in ('b', 'c')),
  key text not null,
  label text not null,
  weight numeric(5, 2) not null default 1 check (weight >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

comment on table public.score_criteria is
  'Configurable weight per scoring criterion, one set per organization. Weights are plain data — adjustable without a code change.';

create index score_criteria_organization_id_idx on public.score_criteria (organization_id);

create trigger score_criteria_set_updated_at
  before update on public.score_criteria
  for each row
  execute function public.set_updated_at();

-- Defense in depth: a criterion's package_type must match the owning
-- organization's actual package_type (mirrors the profile/event cross-check
-- pattern used for profile_event_links).
create or replace function public.check_score_criteria_package_type()
returns trigger
language plpgsql
as $$
declare
  org_package_type text;
begin
  select package_type into org_package_type
  from public.organizations
  where id = new.organization_id;

  if org_package_type is null then
    raise exception 'organization % does not exist', new.organization_id;
  end if;

  if org_package_type <> new.package_type then
    raise exception 'score_criteria.package_type (%) does not match organization % package_type (%)',
      new.package_type, new.organization_id, org_package_type;
  end if;

  return new;
end;
$$;

create trigger score_criteria_check_package_type
  before insert or update on public.score_criteria
  for each row
  execute function public.check_score_criteria_package_type();

alter table public.score_criteria enable row level security;

create policy score_criteria_select
  on public.score_criteria for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy score_criteria_insert
  on public.score_criteria for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy score_criteria_update
  on public.score_criteria for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
