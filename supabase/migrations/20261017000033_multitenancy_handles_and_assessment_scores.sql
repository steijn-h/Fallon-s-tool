-- Scopes handles and assessment_scores to an organization. handles.id keeps
-- its existing readable text id ('h-rendement', ...); like pipeline_stages,
-- the primary key becomes (organization_id, id), and assessment_scores'
-- foreign key becomes the matching composite.
-- Rollback: supabase/migrations_down/20261017000033_multitenancy_handles_and_assessment_scores.sql

alter table public.handles
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.handles set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.handles
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

-- assessment_scores.handle_id's foreign key depends on this index, so the
-- old simple one has to go before the primary key can change shape.
alter table public.assessment_scores drop constraint assessment_scores_handle_id_fkey;
alter table public.handles drop constraint handles_pkey;
alter table public.handles add primary key (organization_id, id);

drop policy if exists handles_all on public.handles;
create policy handles_all
  on public.handles for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.assessment_scores
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.assessment_scores set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.assessment_scores
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

-- The old simple FK was already dropped above, before handles' primary key changed.
alter table public.assessment_scores
  add constraint assessment_scores_handle_id_fkey
  foreign key (organization_id, handle_id) references public.handles (organization_id, id)
  on delete cascade;

create index assessment_scores_organization_id_idx on public.assessment_scores (organization_id);

drop policy if exists assessment_scores_all on public.assessment_scores;
create policy assessment_scores_all
  on public.assessment_scores for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
