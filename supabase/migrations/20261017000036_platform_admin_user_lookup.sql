-- Lets the beheerportaal add an existing auth user to an organization by
-- email instead of requiring the platform admin to copy a raw UUID out of
-- the Supabase dashboard. auth.users itself stays off-limits to the
-- authenticated role — this function only ever returns a single id, and
-- only to a platform admin.
-- Rollback: supabase/migrations_down/20261017000036_platform_admin_user_lookup.sql

create or replace function public.lookup_user_id_by_email(lookup_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_platform_admin() then (
      select id from auth.users where email = lookup_email limit 1
    )
    else null
  end;
$$;

revoke all on function public.lookup_user_id_by_email(text) from public;
grant execute on function public.lookup_user_id_by_email(text) to authenticated;
