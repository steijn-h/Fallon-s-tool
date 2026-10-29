-- Rollback for 20261017000034_multitenancy_year_targets.sql
drop policy if exists year_targets_all on public.year_targets;

alter table public.year_targets alter column organization_id drop default;
alter table public.year_targets drop constraint year_targets_pkey;

-- Going back to one global row is inherently lossy once more than one
-- organization exists (there is no sensible way to merge several
-- organizations' targets into one row) — keep the demo organization's row
-- if it is present, otherwise an arbitrary one, and drop the rest.
delete from public.year_targets
where organization_id not in (
  select organization_id from public.year_targets
  order by (organization_id = '00000000-0000-0000-0000-000000000001') desc, organization_id
  limit 1
);

alter table public.year_targets add column id smallint default 1 check (id = 1);
update public.year_targets set id = 1;
alter table public.year_targets add primary key (id);
alter table public.year_targets drop column organization_id;

create policy year_targets_all
  on public.year_targets for all
  to authenticated
  using (true)
  with check (true);
