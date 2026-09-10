-- platform_admins: an explicit, tiny allowlist of auth users who may see and
-- act across every organization, for internal support/testing accounts
-- (e.g. a "fallontest" account). This is a deliberate, audited exception to
-- the "one user = one organization" isolation the rest of the schema
-- enforces — NOT a general admin role, and NOT exposed through any RLS
-- policy of its own: nobody can read or write this table through the API,
-- only a migration/seed running as postgres (or the Supabase SQL editor)
-- can grant or revoke platform-admin status. See README for how to add an
-- account to it.
--
-- Every existing tenant-scoped table gets its policies amended (via ALTER
-- POLICY, not dropped/recreated) to also allow rows through when the
-- caller is a platform admin, regardless of organization_id. Tables that
-- are intentionally append-only for every user (notes, relationship_scores,
-- score_components) stay append-only for platform admins too — "sees and
-- can act on everything" does not extend to rewriting audit history.
-- Rollback: supabase/migrations_down/20260910000018_platform_admins.sql

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
-- No policies: this table is unreachable via the anon/authenticated API
-- roles entirely (default-deny), by design.

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

-- organizations
alter policy organizations_select_own on public.organizations
  using (id = public.current_organization_id() or public.is_platform_admin());
alter policy organizations_update_owner on public.organizations
  using ((id = public.current_organization_id() and public.current_role() = 'owner') or public.is_platform_admin())
  with check (id = public.current_organization_id() or public.is_platform_admin());

-- organization_members
alter policy organization_members_select_own_org on public.organization_members
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy organization_members_insert_admin on public.organization_members
  with check (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  );
alter policy organization_members_update_admin on public.organization_members
  using (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  )
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy organization_members_delete_admin on public.organization_members
  using (
    (organization_id = public.current_organization_id() and public.is_admin_or_owner())
    or public.is_platform_admin()
  );

-- lead_sources
alter policy lead_sources_select on public.lead_sources
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy lead_sources_insert on public.lead_sources
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy lead_sources_update on public.lead_sources
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- archetypes
alter policy archetypes_select on public.archetypes
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy archetypes_insert on public.archetypes
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy archetypes_update on public.archetypes
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- profiles
alter policy profiles_select on public.profiles
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profiles_insert on public.profiles
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profiles_update on public.profiles
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- profile_lead_source
alter policy profile_lead_source_select on public.profile_lead_source
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profile_lead_source_insert on public.profile_lead_source
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profile_lead_source_update on public.profile_lead_source
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- tasks
alter policy tasks_select on public.tasks
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy tasks_insert on public.tasks
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy tasks_update on public.tasks
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- notes (append-only for everyone, including platform admins: select + insert only)
alter policy notes_select on public.notes
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy notes_insert on public.notes
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- relationship_scores (append-only for everyone: select + insert only)
alter policy relationship_scores_select on public.relationship_scores
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy relationship_scores_insert on public.relationship_scores
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- events
alter policy events_select on public.events
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy events_insert on public.events
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy events_update on public.events
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- profile_event_links
alter policy profile_event_links_select on public.profile_event_links
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profile_event_links_insert on public.profile_event_links
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy profile_event_links_delete on public.profile_event_links
  using (organization_id = public.current_organization_id() or public.is_platform_admin());

-- score_criteria
alter policy score_criteria_select on public.score_criteria
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy score_criteria_insert on public.score_criteria
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy score_criteria_update on public.score_criteria
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- score_components (append-only for everyone: select + insert only)
alter policy score_components_select on public.score_components
  using (organization_id = public.current_organization_id() or public.is_platform_admin());
alter policy score_components_insert on public.score_components
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
