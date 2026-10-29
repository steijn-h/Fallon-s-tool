-- Adds run_id to relationship_scores: nullable, only set on rows written by
-- an automated score calculation (score_type 'sponsor' or 'city'). It
-- correlates that total with the score_components rows from the same run.
-- Manually entered relationship scores (score_type 'relationship') keep
-- run_id null. No RLS change needed — existing policies already cover the
-- new column.
-- Rollback: supabase/migrations_down/20260910000016_relationship_scores_run_id.sql

alter table public.relationship_scores
  add column run_id uuid;

create index relationship_scores_run_id_idx
  on public.relationship_scores (run_id)
  where run_id is not null;
