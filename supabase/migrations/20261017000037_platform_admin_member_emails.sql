-- Lets the beheerportaal show which email address each organization_members
-- row belongs to, without exposing auth.users to the authenticated role in
-- general. Platform-admin-only, same pattern as lookup_user_id_by_email.
-- Rollback: supabase/migrations_down/20261017000037_platform_admin_member_emails.sql

create or replace function public.lookup_user_email(lookup_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_platform_admin() then (
      select email from auth.users where id = lookup_user_id limit 1
    )
    else null
  end;
$$;

revoke all on function public.lookup_user_email(uuid) from public;
grant execute on function public.lookup_user_email(uuid) to authenticated;
