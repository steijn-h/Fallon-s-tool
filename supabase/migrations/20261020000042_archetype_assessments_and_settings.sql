-- archetype_assessments: an append-only log of staff judgements on whether
-- a prospect/sponsorship actually matches its assigned archetype, with
-- explanation — "organisaties die wel/niet gelijk zien aan de persona,
-- inclusief toelichting". Exactly one of prospect_id/sponsorship_id is set.
--
-- archetype_settings: per-organization customization of the six fixed
-- archetypes (which stay code-defined editorial content in
-- src/lib/archetypes.ts) — an optional image and staff notes, one row per
-- archetype per organization, created on first edit rather than seeded.
-- Rollback: supabase/migrations_down/20261020000042_archetype_assessments_and_settings.sql

create table public.archetype_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  prospect_id uuid references public.prospects (id) on delete cascade,
  sponsorship_id uuid references public.sponsorships (id) on delete cascade,
  archetype_id text not null check (
    archetype_id in (
      'calculerende-rationalist', 'lokale-held', 'netwerker-relatiebeheerder',
      'stadstrots-aanjager', 'talentenjager', 'vinkjes-zetter'
    )
  ),
  matches boolean not null,
  explanation text,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint archetype_assessments_one_subject check (
    (prospect_id is not null and sponsorship_id is null)
    or (prospect_id is null and sponsorship_id is not null)
  )
);

create index archetype_assessments_organization_id_idx on public.archetype_assessments (organization_id);
create index archetype_assessments_prospect_id_idx on public.archetype_assessments (prospect_id);
create index archetype_assessments_sponsorship_id_idx on public.archetype_assessments (sponsorship_id);

alter table public.archetype_assessments enable row level security;

create policy archetype_assessments_all
  on public.archetype_assessments for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

create table public.archetype_settings (
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  archetype_id text not null check (
    archetype_id in (
      'calculerende-rationalist', 'lokale-held', 'netwerker-relatiebeheerder',
      'stadstrots-aanjager', 'talentenjager', 'vinkjes-zetter'
    )
  ),
  image_url text,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (organization_id, archetype_id)
);

create trigger archetype_settings_set_updated_at
  before update on public.archetype_settings
  for each row
  execute function public.set_updated_at();

alter table public.archetype_settings enable row level security;

create policy archetype_settings_all
  on public.archetype_settings for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
