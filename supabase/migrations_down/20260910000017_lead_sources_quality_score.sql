-- Rollback for 20260910000017_lead_sources_quality_score.sql
alter table public.lead_sources drop column if exists quality_score;
