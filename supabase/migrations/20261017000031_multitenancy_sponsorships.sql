-- Scopes sponsorships and sponsorship_contacts to an organization.
-- Rollback: supabase/migrations_down/20261017000031_multitenancy_sponsorships.sql

alter table public.sponsorships
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.sponsorships set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.sponsorships
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index sponsorships_organization_id_idx on public.sponsorships (organization_id);

drop policy if exists sponsorships_all on public.sponsorships;
create policy sponsorships_all
  on public.sponsorships for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.sponsorship_contacts
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.sponsorship_contacts set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.sponsorship_contacts
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index sponsorship_contacts_organization_id_idx on public.sponsorship_contacts (organization_id);

drop policy if exists sponsorship_contacts_all on public.sponsorship_contacts;
create policy sponsorship_contacts_all
  on public.sponsorship_contacts for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
