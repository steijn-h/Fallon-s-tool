-- Rollback for 20260910000011_events.sql
drop trigger if exists events_set_updated_at on public.events;
drop table if exists public.events;
