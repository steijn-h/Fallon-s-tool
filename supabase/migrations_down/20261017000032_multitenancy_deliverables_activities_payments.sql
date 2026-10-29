-- Rollback for 20261017000032_multitenancy_deliverables_activities_payments.sql
drop policy if exists payments_all on public.payments;
create policy payments_all
  on public.payments for all
  to authenticated
  using (true)
  with check (true);
alter table public.payments drop column organization_id;

drop policy if exists activities_all on public.activities;
create policy activities_all
  on public.activities for all
  to authenticated
  using (true)
  with check (true);
alter table public.activities drop column organization_id;

drop policy if exists deliverables_all on public.deliverables;
create policy deliverables_all
  on public.deliverables for all
  to authenticated
  using (true)
  with check (true);
alter table public.deliverables drop column organization_id;
