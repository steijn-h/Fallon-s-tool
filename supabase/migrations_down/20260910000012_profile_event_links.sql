-- Rollback for 20260910000012_profile_event_links.sql
drop trigger if exists profile_event_links_sync_org on public.profile_event_links;
drop table if exists public.profile_event_links;
drop function if exists public.sync_and_check_profile_event_link();
