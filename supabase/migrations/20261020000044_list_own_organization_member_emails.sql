-- Lets any organization member see the email addresses of their OWN
-- organization's other members — needed so the "koppel aan account"
-- dropdown in Instellingen (owners) can show something more useful than a
-- raw user id. Scoped to the caller's own organization only (unlike
-- lookup_user_email, which is platform-admin-only and can look up any
-- user anywhere).
-- Rollback: supabase/migrations_down/20261020000044_list_own_organization_member_emails.sql

create or replace function public.list_own_organization_member_emails()
returns table (user_id uuid, email text)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id, u.email
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = public.current_organization_id();
$$;

revoke all on function public.list_own_organization_member_emails() from public;
grant execute on function public.list_own_organization_member_emails() to authenticated;
