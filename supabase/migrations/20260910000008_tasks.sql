-- tasks: to-dos linked to a profile, with an owner, status and deadline.
-- Rollback: supabase/migrations_down/20260910000008_tasks.sql

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references auth.users (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  due_date date,
  completed_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_organization_id_idx on public.tasks (organization_id);
create index tasks_profile_id_idx on public.tasks (profile_id);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_status_idx on public.tasks (status);

create trigger tasks_sync_org
  before insert on public.tasks
  for each row
  execute function public.sync_organization_id_from_profile();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy tasks_select
  on public.tasks for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy tasks_insert
  on public.tasks for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy tasks_update
  on public.tasks for update
  to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
