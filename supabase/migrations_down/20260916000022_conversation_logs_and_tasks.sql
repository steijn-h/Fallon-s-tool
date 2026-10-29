-- Rollback for 20260916000022_conversation_logs_and_tasks.sql
drop table if exists public.tasks;
drop table if exists public.conversation_logs;
