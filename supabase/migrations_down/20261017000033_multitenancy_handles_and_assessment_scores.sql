-- Rollback for 20261017000033_multitenancy_handles_and_assessment_scores.sql
drop policy if exists assessment_scores_all on public.assessment_scores;
create policy assessment_scores_all
  on public.assessment_scores for all
  to authenticated
  using (true)
  with check (true);

-- Drop the composite FK before handles' primary key can go back to simple.
alter table public.assessment_scores drop constraint assessment_scores_handle_id_fkey;

drop policy if exists handles_all on public.handles;
create policy handles_all
  on public.handles for all
  to authenticated
  using (true)
  with check (true);

-- Going back to one global set of handles is inherently lossy once more
-- than one organization exists — keep one organization's handles (the demo
-- one if present) and drop the rest, so (id) alone can be unique again.
delete from public.handles
where organization_id not in (
  select organization_id from public.handles
  order by (organization_id = '00000000-0000-0000-0000-000000000001') desc, organization_id
  limit 1
);

alter table public.handles drop constraint handles_pkey;
alter table public.handles add primary key (id);

-- Only safe now that handles has a plain unique (id) again.
alter table public.assessment_scores
  add constraint assessment_scores_handle_id_fkey
  foreign key (handle_id) references public.handles (id)
  on delete cascade;

alter table public.assessment_scores drop column organization_id;
alter table public.handles drop column organization_id;
