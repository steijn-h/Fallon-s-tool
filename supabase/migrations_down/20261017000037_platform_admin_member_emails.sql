-- Rollback for 20261017000037_platform_admin_member_emails.sql
drop function if exists public.lookup_user_email(uuid);
