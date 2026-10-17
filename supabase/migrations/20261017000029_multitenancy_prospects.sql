-- Scopes prospects, prospect_contacts and prospect_phone_numbers to an
-- organization. prospects.stage_id's foreign key becomes a composite
-- (organization_id, stage_id) reference, matching pipeline_stages' new
-- composite primary key from 20261017000028 — existing stage_id values
-- ('lead', 'mql', ...) are untouched, both sides just also need to agree on
-- organization_id, which every existing row already gets backfilled to the
-- same demo organization.
-- Rollback: supabase/migrations_down/20261017000029_multitenancy_prospects.sql

alter table public.prospects
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.prospects set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.prospects
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

-- The old simple FK was already dropped in 20261017000028, before it could
-- change pipeline_stages' primary key out from under it.
alter table public.prospects
  add constraint prospects_stage_id_fkey
  foreign key (organization_id, stage_id) references public.pipeline_stages (organization_id, id)
  on delete restrict;

create index prospects_organization_id_idx on public.prospects (organization_id);

drop policy if exists prospects_all on public.prospects;
create policy prospects_all
  on public.prospects for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.prospect_contacts
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.prospect_contacts set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.prospect_contacts
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index prospect_contacts_organization_id_idx on public.prospect_contacts (organization_id);

drop policy if exists prospect_contacts_all on public.prospect_contacts;
create policy prospect_contacts_all
  on public.prospect_contacts for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.prospect_phone_numbers
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.prospect_phone_numbers set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.prospect_phone_numbers
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index prospect_phone_numbers_organization_id_idx on public.prospect_phone_numbers (organization_id);

drop policy if exists prospect_phone_numbers_all on public.prospect_phone_numbers;
create policy prospect_phone_numbers_all
  on public.prospect_phone_numbers for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
