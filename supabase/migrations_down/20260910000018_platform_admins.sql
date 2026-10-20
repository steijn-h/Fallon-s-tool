-- Rollback for 20260910000018_platform_admins.sql
-- Restores every amended policy to its original (pre-platform-admin) clause.

alter policy score_components_select on public.score_components
  using (organization_id = public.current_organization_id());
alter policy score_components_insert on public.score_components
  with check (organization_id = public.current_organization_id());

alter policy score_criteria_select on public.score_criteria
  using (organization_id = public.current_organization_id());
alter policy score_criteria_insert on public.score_criteria
  with check (organization_id = public.current_organization_id());
alter policy score_criteria_update on public.score_criteria
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy profile_event_links_select on public.profile_event_links
  using (organization_id = public.current_organization_id());
alter policy profile_event_links_insert on public.profile_event_links
  with check (organization_id = public.current_organization_id());
alter policy profile_event_links_delete on public.profile_event_links
  using (organization_id = public.current_organization_id());

alter policy events_select on public.events
  using (organization_id = public.current_organization_id());
alter policy events_insert on public.events
  with check (organization_id = public.current_organization_id());
alter policy events_update on public.events
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy relationship_scores_select on public.relationship_scores
  using (organization_id = public.current_organization_id());
alter policy relationship_scores_insert on public.relationship_scores
  with check (organization_id = public.current_organization_id());

alter policy notes_select on public.notes
  using (organization_id = public.current_organization_id());
alter policy notes_insert on public.notes
  with check (organization_id = public.current_organization_id());

alter policy tasks_select on public.tasks
  using (organization_id = public.current_organization_id());
alter policy tasks_insert on public.tasks
  with check (organization_id = public.current_organization_id());
alter policy tasks_update on public.tasks
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy profile_lead_source_select on public.profile_lead_source
  using (organization_id = public.current_organization_id());
alter policy profile_lead_source_insert on public.profile_lead_source
  with check (organization_id = public.current_organization_id());
alter policy profile_lead_source_update on public.profile_lead_source
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy profiles_select on public.profiles
  using (organization_id = public.current_organization_id());
alter policy profiles_insert on public.profiles
  with check (organization_id = public.current_organization_id());
alter policy profiles_update on public.profiles
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy archetypes_select on public.archetypes
  using (organization_id = public.current_organization_id());
alter policy archetypes_insert on public.archetypes
  with check (organization_id = public.current_organization_id());
alter policy archetypes_update on public.archetypes
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy lead_sources_select on public.lead_sources
  using (organization_id = public.current_organization_id());
alter policy lead_sources_insert on public.lead_sources
  with check (organization_id = public.current_organization_id());
alter policy lead_sources_update on public.lead_sources
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

alter policy organization_members_select_own_org on public.organization_members
  using (organization_id = public.current_organization_id());
alter policy organization_members_insert_admin on public.organization_members
  with check (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  );
alter policy organization_members_update_admin on public.organization_members
  using (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  )
  with check (organization_id = public.current_organization_id());
alter policy organization_members_delete_admin on public.organization_members
  using (
    organization_id = public.current_organization_id()
    and public.is_admin_or_owner()
  );

alter policy organizations_select_own on public.organizations
  using (id = public.current_organization_id());
alter policy organizations_update_owner on public.organizations
  using (id = public.current_organization_id() and public.current_role() = 'owner')
  with check (id = public.current_organization_id());

drop function if exists public.is_platform_admin();
drop table if exists public.platform_admins;
