-- Rollback for 20261017000027_organizations_and_members.sql
drop policy if exists organization_members_delete_admin on public.organization_members;
drop policy if exists organization_members_update_admin on public.organization_members;
drop policy if exists organization_members_insert_admin on public.organization_members;
drop policy if exists organization_members_select_own_org on public.organization_members;

drop policy if exists organizations_delete_platform_admin on public.organizations;
drop policy if exists organizations_update_platform_admin on public.organizations;
drop policy if exists organizations_insert_platform_admin on public.organizations;
drop policy if exists organizations_select_own on public.organizations;

drop function if exists public.is_platform_admin();
drop function if exists public.is_admin_or_owner();
drop function if exists public.current_role();
drop function if exists public.current_organization_id();

drop table if exists public.platform_admins;
drop table if exists public.organization_members;
drop table if exists public.organizations;
