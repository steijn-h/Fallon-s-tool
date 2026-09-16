-- Rollback for 20260916000026_year_targets.sql
drop trigger if exists year_targets_set_updated_at on public.year_targets;
drop table if exists public.year_targets;
