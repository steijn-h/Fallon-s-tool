-- profiles: the organizations/contacts managed through the portal (sponsors,
-- leads, potential sponsors), including NAWTE details (naam, adres,
-- woonplaats, telefoon, e-mail).
--
-- `custom_fields` (jsonb) exists so package-specific fields (e.g. sector for
-- citymarketing, event interest for evenementen) can be added later without
-- an ALTER TABLE. Package UI code reads/writes named keys in this object;
-- the column itself never needs a schema change when a new field is added.
-- Rollback: supabase/migrations_down/20260910000006_profiles.sql

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  archetype_id uuid references public.archetypes (id) on delete set null,
  status text not null default 'lead' check (status in ('lead', 'prospect', 'sponsor', 'inactive')),

  -- NAWTE
  organization_name text not null,
  contact_name text,
  street text,
  house_number text,
  postal_code text,
  city text,
  phone text,
  email text,

  custom_fields jsonb not null default '{}'::jsonb,

  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.custom_fields is
  'Package-specific fields (per pakket a/b/c), keyed by field name. Keeps the schema stable as pakket-specific UI evolves.';

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_status_idx on public.profiles (status);
create index profiles_archetype_id_idx on public.profiles (archetype_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select
  on public.profiles for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy profiles_insert
  on public.profiles for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy profiles_update
  on public.profiles for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
