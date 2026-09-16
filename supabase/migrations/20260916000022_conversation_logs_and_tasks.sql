-- conversation_logs and tasks both belong to a prospect (SponsorHub does not
-- have profile-independent tasks/notes the way the old schema did).
-- Rollback: supabase/migrations_down/20260916000022_conversation_logs_and_tasks.sql

create table public.conversation_logs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  log_date date not null default current_date,
  contact_type text not null check (contact_type in ('telefoon', 'email', 'persoonlijk', 'teams', 'anders')),
  summary text not null,
  content text,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index conversation_logs_prospect_id_idx on public.conversation_logs (prospect_id);

alter table public.conversation_logs enable row level security;

create policy conversation_logs_all
  on public.conversation_logs for all
  to authenticated
  using (true)
  with check (true);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'normaal' check (priority in ('laag', 'normaal', 'hoog')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_prospect_id_idx on public.tasks (prospect_id);
create index tasks_due_date_idx on public.tasks (due_date);

alter table public.tasks enable row level security;

create policy tasks_all
  on public.tasks for all
  to authenticated
  using (true)
  with check (true);
