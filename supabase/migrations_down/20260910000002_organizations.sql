-- Rollback for 20260910000002_organizations.sql
drop trigger if exists organizations_set_updated_at on public.organizations;
drop table if exists public.organizations;
