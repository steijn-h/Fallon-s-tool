-- Scopes conversation_logs and tasks to an organization.
-- Rollback: supabase/migrations_down/20261017000030_multitenancy_conversation_logs_and_tasks.sql

alter table public.conversation_logs
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.conversation_logs set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.conversation_logs
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index conversation_logs_organization_id_idx on public.conversation_logs (organization_id);

drop policy if exists conversation_logs_all on public.conversation_logs;
create policy conversation_logs_all
  on public.conversation_logs for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());

alter table public.tasks
  add column organization_id uuid references public.organizations (id) on delete cascade;
update public.tasks set organization_id = '00000000-0000-0000-0000-000000000001' where organization_id is null;
alter table public.tasks
  alter column organization_id set not null,
  alter column organization_id set default public.current_organization_id();

create index tasks_organization_id_idx on public.tasks (organization_id);

drop policy if exists tasks_all on public.tasks;
create policy tasks_all
  on public.tasks for all
  to authenticated
  using (organization_id = public.current_organization_id() or public.is_platform_admin())
  with check (organization_id = public.current_organization_id() or public.is_platform_admin());
