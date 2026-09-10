-- profile_lead_source: origin of a lead, one current record per profile.
--
-- organization_id is denormalized onto this (and every other profile-child)
-- table and auto-filled from the parent profile by a BEFORE INSERT trigger.
-- This keeps every RLS policy a flat `organization_id = current_organization_id()`
-- check instead of a join through profiles, which is both simpler to audit
-- and cheaper to evaluate.
-- Rollback: supabase/migrations_down/20260910000007_profile_lead_source.sql

create or replace function public.sync_organization_id_from_profile()
returns trigger
language plpgsql
as $$
declare
  profile_org_id uuid;
begin
  select organization_id into profile_org_id
  from public.profiles
  where id = new.profile_id;

  if profile_org_id is null then
    raise exception 'profile % does not exist', new.profile_id;
  end if;

  new.organization_id = profile_org_id;
  return new;
end;
$$;

create table public.profile_lead_source (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  lead_source_id uuid not null references public.lead_sources (id),
  note text,
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now()
);

create index profile_lead_source_organization_id_idx
  on public.profile_lead_source (organization_id);
create index profile_lead_source_lead_source_id_idx
  on public.profile_lead_source (lead_source_id);

create trigger profile_lead_source_sync_org
  before insert on public.profile_lead_source
  for each row
  execute function public.sync_organization_id_from_profile();

alter table public.profile_lead_source enable row level security;

create policy profile_lead_source_select
  on public.profile_lead_source for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy profile_lead_source_insert
  on public.profile_lead_source for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy profile_lead_source_update
  on public.profile_lead_source for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
