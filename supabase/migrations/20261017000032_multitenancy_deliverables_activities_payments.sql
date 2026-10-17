-- Scopes deliverables, activities and payments to an organization.
-- Rollback: supabase/migrations_down/20261017000032_multitenancy_deliverables_activities_payments.sql

alter table public.deliverables
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.deliverables set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.deliverables
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index deliverables_organization_id_idx on public.deliverables (organization_id);

drop policy if exists deliverables_all on public.deliverables;
create policy deliverables_all
  on public.deliverables for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.activities
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.activities set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.activities
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index activities_organization_id_idx on public.activities (organization_id);

drop policy if exists activities_all on public.activities;
create policy activities_all
  on public.activities for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.payments
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.payments set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.payments
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index payments_organization_id_idx on public.payments (organization_id);

drop policy if exists payments_all on public.payments;
create policy payments_all
  on public.payments for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
