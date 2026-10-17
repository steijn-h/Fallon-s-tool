-- year_targets was a single global row (id smallint, forced to 1). With
-- organizations back, "one row of targets" needs to mean one row PER
-- organization, so organization_id — not a fixed smallint — becomes the
-- primary key: naturally still exactly one row per tenant, no separate
-- uniqueness trick needed.
-- Rollback: supabase/migrations_down/20261017000034_multitenancy_year_targets.sql

alter table public.year_targets
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.year_targets set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.year_targets alter column organization_id set not null;

alter table public.year_targets drop constraint year_targets_pkey;
alter table public.year_targets drop column id;
alter table public.year_targets add primary key (organization_id);
alter table public.year_targets alter column organization_id set default public.current_organization_id();

drop policy if exists year_targets_all on public.year_targets;
create policy year_targets_all
  on public.year_targets for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
