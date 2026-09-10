-- Rollback for 20260910000013_organization_members_display_fields.sql
drop trigger if exists organization_members_set_display_fields on public.organization_members;
drop function if exists public.set_member_display_fields();
alter table public.organization_members
  drop column if exists full_name,
  drop column if exists email;
