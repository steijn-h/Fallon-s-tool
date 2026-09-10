-- Rollback for 20260910000007_profile_lead_source.sql
drop trigger if exists profile_lead_source_sync_org on public.profile_lead_source;
drop table if exists public.profile_lead_source;
drop function if exists public.sync_organization_id_from_profile();
