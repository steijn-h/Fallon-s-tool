-- Rollback for 20261017000036_platform_admin_user_lookup.sql
drop function if exists public.lookup_user_id_by_email(text);
