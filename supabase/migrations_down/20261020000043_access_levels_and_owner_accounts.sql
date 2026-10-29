-- Rollback for 20261020000043_access_levels_and_owner_accounts.sql
drop policy if exists sponsorships_delete on public.sponsorships;
drop policy if exists sponsorships_update on public.sponsorships;
drop policy if exists sponsorships_insert on public.sponsorships;
drop policy if exists sponsorships_select on public.sponsorships;
create policy sponsorships_all
  on public.sponsorships for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

drop policy if exists prospects_delete on public.prospects;
drop policy if exists prospects_update on public.prospects;
drop policy if exists prospects_insert on public.prospects;
drop policy if exists prospects_select on public.prospects;
create policy prospects_all
  on public.prospects for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

drop function if exists public.current_access_level();

alter table public.organization_members drop column access_level;

drop index if exists public.owners_user_id_key;
alter table public.owners drop column user_id;
