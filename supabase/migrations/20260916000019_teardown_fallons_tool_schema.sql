-- Teardown of the "Fallon's Tool" multi-tenant sponsor-/citymarketingportaal
-- schema (fase 1 + fase 2). The product direction changed to "SponsorHub", a
-- single-club sponsorship CRM (see migrations 20260916000020 and onward) —
-- there is no multi-tenant/pakket concept in the new product, so the old
-- organization-scoped tables, RLS-helper functions and the platform-admin
-- bypass are all removed rather than carried forward unused.
--
-- `set_updated_at()` is intentionally NOT dropped: it's a generic trigger
-- with no dependency on the old domain, and SponsorHub reuses it.
--
-- Rollback: supabase/migrations_down/20260916000019_teardown_fallons_tool_schema.sql
-- (see that file for why this teardown is not mechanically reversible).

drop table if exists public.score_components cascade;
drop table if exists public.score_criteria cascade;
drop table if exists public.platform_admins cascade;
drop table if exists public.profile_event_links cascade;
drop table if exists public.events cascade;
drop table if exists public.relationship_scores cascade;
drop table if exists public.notes cascade;
drop table if exists public.tasks cascade;
drop table if exists public.profile_lead_source cascade;
drop table if exists public.profiles cascade;
drop table if exists public.archetypes cascade;
drop table if exists public.lead_sources cascade;
drop table if exists public.organization_members cascade;
drop table if exists public.organizations cascade;

drop function if exists public.is_platform_admin();
drop function if exists public.check_score_criteria_package_type();
drop function if exists public.sync_and_check_profile_event_link();
drop function if exists public.sync_organization_id_from_profile();
drop function if exists public.is_admin_or_owner();
drop function if exists public.current_role();
drop function if exists public.current_organization_id();
drop function if exists public.set_member_display_fields();
