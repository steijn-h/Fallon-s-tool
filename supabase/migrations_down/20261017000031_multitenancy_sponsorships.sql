-- Rollback for 20261017000031_multitenancy_sponsorships.sql
drop policy if exists sponsorship_contacts_all on public.sponsorship_contacts;
create policy sponsorship_contacts_all
  on public.sponsorship_contacts for all
  to authenticated
  using (true)
  with check (true);
alter table public.sponsorship_contacts drop column organization_id;

drop policy if exists sponsorships_all on public.sponsorships;
create policy sponsorships_all
  on public.sponsorships for all
  to authenticated
  using (true)
  with check (true);
alter table public.sponsorships drop column organization_id;
