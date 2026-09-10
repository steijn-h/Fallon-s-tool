-- Rollback for 20260910000015_score_components.sql
drop trigger if exists score_components_sync_org on public.score_components;
drop table if exists public.score_components;
