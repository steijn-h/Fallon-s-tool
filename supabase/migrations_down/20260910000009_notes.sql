-- Rollback for 20260910000009_notes.sql
drop trigger if exists notes_sync_org on public.notes;
drop table if exists public.notes;
