-- Two corrections from client feedback (19 oktober):
--
-- 1. A "dealverantwoordelijke" (owners.*) should be able to be a real
--    portal account (deriving rights), OR stay a plain name for someone
--    without their own login — "mix van beide". owners.user_id is
--    nullable: set it to link an owner row to a real account.
--
-- 2. Per-user permission levels, settable per organization member: 'full'
--    (everything), 'assigned' (only write to prospects/sponsorships whose
--    owner is linked to them), 'readonly' (no writes at all). Enforced on
--    prospects and sponsorships only, which is the meaningful boundary
--    ("mag ik dit profiel bewerken") — child records (contacts, tasks,
--    deliverables, ...) are not separately gated in this pass, which is a
--    known, intentional scope limit, not an oversight.
-- Rollback: supabase/migrations_down/20261020000043_access_levels_and_owner_accounts.sql

alter table public.owners
  add column user_id uuid references auth.users (id) on delete set null;

create unique index owners_user_id_key on public.owners (user_id) where user_id is not null;

alter table public.organization_members
  add column access_level text not null default 'full' check (access_level in ('full', 'assigned', 'readonly'));

create or replace function public.current_access_level()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select access_level from public.organization_members where user_id = auth.uid() limit 1;
$$;

revoke all on function public.current_access_level() from public;
grant execute on function public.current_access_level() to authenticated;

-- prospects: split the single "for all" policy so SELECT stays open to
-- every org member (including readonly), while writes also require
-- 'full', or 'assigned' limited to prospects owned by the caller's linked
-- owner row.
drop policy if exists prospects_all on public.prospects;

create policy prospects_select
  on public.prospects for select
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin());

create policy prospects_insert
  on public.prospects for insert
  to authenticated
  with check (
    (organization_id = public.current_organization_id() and public.current_access_level() in ('full', 'assigned'))
    or public.is_platform_admin()
  );

create policy prospects_update
  on public.prospects for update
  to authenticated
  using (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  )
  with check (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  );

create policy prospects_delete
  on public.prospects for delete
  to authenticated
  using (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  );

-- sponsorships: identical pattern.
drop policy if exists sponsorships_all on public.sponsorships;

create policy sponsorships_select
  on public.sponsorships for select
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin());

create policy sponsorships_insert
  on public.sponsorships for insert
  to authenticated
  with check (
    (organization_id = public.current_organization_id() and public.current_access_level() in ('full', 'assigned'))
    or public.is_platform_admin()
  );

create policy sponsorships_update
  on public.sponsorships for update
  to authenticated
  using (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  )
  with check (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  );

create policy sponsorships_delete
  on public.sponsorships for delete
  to authenticated
  using (
    (
      organization_id = public.current_organization_id()
      and (
        public.current_access_level() = 'full'
        or (
          public.current_access_level() = 'assigned'
          and owner_id in (select id from public.owners where user_id = auth.uid())
        )
      )
    )
    or public.is_platform_admin()
  );
