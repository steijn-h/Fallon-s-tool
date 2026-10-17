-- Rollback for 20261017000028_multitenancy_owners_and_pipeline_stages.sql
drop policy if exists pipeline_stages_all on public.pipeline_stages;
create policy pipeline_stages_all
  on public.pipeline_stages for all
  to authenticated
  using (true)
  with check (true);

-- Going back to one global set of stages is inherently lossy once more
-- than one organization exists — keep one organization's stages (the demo
-- one if present) and drop the rest, so (id) alone can be unique again.
delete from public.pipeline_stages
where organization_id not in (
  select organization_id from public.pipeline_stages
  order by (organization_id = '00000000-0000-0000-0000-000000000001') desc, organization_id
  limit 1
);

alter table public.pipeline_stages drop constraint pipeline_stages_pkey;
alter table public.pipeline_stages add primary key (id);
alter table public.pipeline_stages drop column organization_id;

-- Restore the simple (pre-multi-tenant) foreign key this migration's "up"
-- had to drop before it could change pipeline_stages' primary key. Only
-- valid once 20261017000029's down has already dropped the composite one
-- it added (down-migrations run in reverse order, so that happens first).
alter table public.prospects
  add constraint prospects_stage_id_fkey
  foreign key (stage_id) references public.pipeline_stages (id)
  on delete restrict;

drop policy if exists owners_all on public.owners;
create policy owners_all
  on public.owners for all
  to authenticated
  using (true)
  with check (true);

alter table public.owners drop column organization_id;
