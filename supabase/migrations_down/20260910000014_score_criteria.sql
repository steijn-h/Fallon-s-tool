-- Rollback for 20260910000014_score_criteria.sql
drop trigger if exists score_criteria_check_package_type on public.score_criteria;
drop function if exists public.check_score_criteria_package_type();
drop trigger if exists score_criteria_set_updated_at on public.score_criteria;
drop table if exists public.score_criteria;
