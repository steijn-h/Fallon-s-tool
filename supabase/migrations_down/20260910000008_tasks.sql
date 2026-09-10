-- Rollback for 20260910000008_tasks.sql
drop trigger if exists tasks_set_updated_at on public.tasks;
drop trigger if exists tasks_sync_org on public.tasks;
drop table if exists public.tasks;
