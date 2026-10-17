-- Rollback for 20261017000030_multitenancy_conversation_logs_and_tasks.sql
drop policy if exists tasks_all on public.tasks;
create policy tasks_all
  on public.tasks for all
  to authenticated
  using (true)
  with check (true);
alter table public.tasks drop column organization_id;

drop policy if exists conversation_logs_all on public.conversation_logs;
create policy conversation_logs_all
  on public.conversation_logs for all
  to authenticated
  using (true)
  with check (true);
alter table public.conversation_logs drop column organization_id;
