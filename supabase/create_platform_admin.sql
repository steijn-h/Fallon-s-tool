-- Creates a platform-admin account that can see and manage data across
-- EVERY organization, bypassing the normal one-organization-per-user
-- isolation (see migration 20260910000018_platform_admins.sql for how that
-- bypass is implemented and exactly which tables it touches).
--
-- This is deliberately NOT part of supabase/seed.sql: a cross-organization
-- admin account should be created once, on purpose, with its own password —
-- never regenerated automatically by every `supabase db reset`.
--
-- HOW TO USE
--   1. Change ADMIN_EMAIL and ADMIN_PASSWORD below to real values. Do not
--      reuse the shared demo password from seed.sql — this account can see
--      and change every customer's data.
--   2. Run this whole file once in the Supabase SQL Editor (or via psql)
--      against your project.
--   3. Log in with those credentials. You'll land in a small dedicated
--      "Fallon's Tool (intern)" organization used only to give the admin's
--      UI shell (nav, package-driven tabs) somewhere to render from — the
--      RLS bypass is what actually grants access to every other
--      organization's data, not membership in this one.
--
-- To revoke platform-admin rights later without deleting the account:
--   delete from public.platform_admins where user_id = (
--     select id from auth.users where email = 'ADMIN_EMAIL'
--   );

do $$
declare
  admin_email text := 'fallontest@fallonstool.test'; -- <-- change if desired
  admin_password text := '';  -- <-- set a real, strong password here before running
  admin_org_id uuid;
  admin_user_id uuid;
begin
  if admin_password = '' then
    raise exception 'Set admin_password near the top of this script before running it.';
  end if;

  insert into public.organizations (name, package_type)
  values ('Fallon''s Tool (intern)', 'c')
  returning id into admin_org_id;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    admin_email, crypt(admin_password, gen_salt('bf')), now(),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fallon Test"}'::jsonb,
    now(), now(), '', '', '', ''
  )
  returning id into admin_user_id;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), admin_user_id, admin_user_id::text,
    jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
    'email', now(), now(), now()
  );

  insert into public.organization_members (organization_id, user_id, role)
  values (admin_org_id, admin_user_id, 'owner');

  insert into public.platform_admins (user_id, note)
  values (admin_user_id, 'fallontest — created via create_platform_admin.sql');

  raise notice 'Platform admin created: % (organization %)', admin_email, admin_org_id;
end
$$;
