-- organization_members display fields: auth.users is not exposed over
-- PostgREST, so the UI has no way to show "who" a task is assigned to or who
-- authored a note. This denormalizes email/full_name from auth.users onto
-- organization_members at insert time via a trigger with direct SQL access
-- to the auth schema (a normal Postgres function can read auth.users; only
-- the REST API can't).
-- Rollback: supabase/migrations_down/20260910000013_organization_members_display_fields.sql

alter table public.organization_members
  add column email text,
  add column full_name text;

create or replace function public.set_member_display_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select email, raw_user_meta_data ->> 'full_name'
  into new.email, new.full_name
  from auth.users
  where id = new.user_id;

  return new;
end;
$$;

create trigger organization_members_set_display_fields
  before insert on public.organization_members
  for each row
  execute function public.set_member_display_fields();
