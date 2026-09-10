-- Rollback for 20260910000016_relationship_scores_run_id.sql
drop index if exists public.relationship_scores_run_id_idx;
alter table public.relationship_scores drop column if exists run_id;
