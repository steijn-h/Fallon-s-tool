-- Rollback for 20260916000020_owners_and_pipeline_stages.sql
drop table if exists public.pipeline_stages;
drop table if exists public.owners;
