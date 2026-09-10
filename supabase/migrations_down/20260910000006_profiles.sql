-- Rollback for 20260910000006_profiles.sql
drop trigger if exists profiles_set_updated_at on public.profiles;
drop table if exists public.profiles;
