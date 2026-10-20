-- assessment_scores.score moves from "staff types a number" to "computed
-- by a formula from recorded activity, recalculated after every relevant
-- action" (application-side, see src/lib/scoring.ts). A manual override
-- is only possible by filing a dispute here, reviewed by someone with
-- access_level = 'full'.
--
-- assessment_scores also gets an `explanation` column: the formula's own
-- generated reasoning ("why 63 and not 81", improvement points, risks) —
-- replacing the old free-text `note` staff used to type themselves.
-- Rollback: supabase/migrations_down/20261020000045_score_disputes.sql

alter table public.assessment_scores
  add column explanation text;

create table public.score_disputes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade default public.current_organization_id(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  handle_id text not null,
  current_score numeric(5, 2) not null,
  requested_score numeric(5, 2) not null check (requested_score >= 0 and requested_score <= 100),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  review_feedback text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint score_disputes_handle_fk
    foreign key (organization_id, handle_id) references public.handles (organization_id, id) on delete cascade
);

create index score_disputes_organization_id_idx on public.score_disputes (organization_id);
create index score_disputes_sponsorship_id_idx on public.score_disputes (sponsorship_id);

alter table public.score_disputes enable row level security;

-- Anyone in the organization can file a dispute and see all disputes
-- (so the requester can see the outcome + feedback).
create policy score_disputes_select
  on public.score_disputes for select
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin());

create policy score_disputes_insert
  on public.score_disputes for insert
  to authenticated
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

-- Only reviewing (status/feedback) by someone with full access — "iemand
-- met alle rechten" — or a platform admin.
create policy score_disputes_update
  on public.score_disputes for update
  to authenticated
  using (
    (organization_id = public.current_organization_id() and public.current_access_level() = 'full')
    or public.is_platform_admin()
  )
  with check (
    (organization_id = public.current_organization_id() and public.current_access_level() = 'full')
    or public.is_platform_admin()
  );
