-- Rollback for 20261017000035_organization_defaults_trigger.sql
drop trigger if exists organizations_seed_defaults on public.organizations;
drop function if exists public.seed_organization_defaults();
