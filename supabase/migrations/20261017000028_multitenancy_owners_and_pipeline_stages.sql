-- Scopes owners and pipeline_stages to an organization, now that SponsorHub
-- is multi-tenant again (20261017000027). Both columns are added nullable
-- first, backfilled onto the demo organization (safe whether the table is
-- empty on a fresh project or already holds this session's example/real
-- data), then locked to not null with a default so ordinary inserts from
-- the app don't need any code changes.
--
-- pipeline_stages.id stays the same readable text id ('lead', 'mql', ...)
-- it always was — only the primary key becomes (organization_id, id), so
-- every organization gets its own independent set of stage ids without
-- renumbering anything that already exists.
-- Rollback: supabase/migrations_down/20261017000028_multitenancy_owners_and_pipeline_stages.sql

alter table public.owners
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.owners set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.owners
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index owners_organization_id_idx on public.owners (organization_id);

drop policy if exists owners_all on public.owners;
create policy owners_all
  on public.owners for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.pipeline_stages
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.pipeline_stages set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.pipeline_stages
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

-- prospects.stage_id's foreign key depends on this index, so it has to be
-- dropped here (the matching composite replacement is added once prospects
-- gets its own organization_id, in 20261017000029).
alter table public.prospects drop constraint prospects_stage_id_fkey;
alter table public.pipeline_stages drop constraint pipeline_stages_pkey;
alter table public.pipeline_stages add primary key (organization_id, id);

drop policy if exists pipeline_stages_all on public.pipeline_stages;
create policy pipeline_stages_all
  on public.pipeline_stages for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
