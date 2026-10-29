-- Rollback for 20260916000021_prospects.sql
drop table if exists public.prospect_phone_numbers;
drop table if exists public.prospect_contacts;
drop trigger if exists prospects_set_updated_at on public.prospects;
drop table if exists public.prospects;
