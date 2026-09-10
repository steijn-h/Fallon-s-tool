-- Rollback for 20260910000010_relationship_scores.sql
drop trigger if exists relationship_scores_sync_org on public.relationship_scores;
drop table if exists public.relationship_scores;
