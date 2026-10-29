-- Rollback for 20260916000025_handles_and_assessment_scores.sql
drop trigger if exists assessment_scores_set_updated_at on public.assessment_scores;
drop table if exists public.assessment_scores;
drop table if exists public.handles;
