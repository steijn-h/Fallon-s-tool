-- Rollback for 20260916000023_sponsorships.sql
drop table if exists public.sponsorship_contacts;
drop trigger if exists sponsorships_set_updated_at on public.sponsorships;
drop table if exists public.sponsorships;
