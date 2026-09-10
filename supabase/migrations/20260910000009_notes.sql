-- notes: free-form notes on a profile, chronological, with an author.
-- Immutable once written (no UPDATE policy) so the chronological trail on a
-- profile stays trustworthy.
-- Rollback: supabase/migrations_down/20260910000009_notes.sql

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index notes_organization_id_idx on public.notes (organization_id);
create index notes_profile_id_idx on public.notes (profile_id);
create index notes_created_at_idx on public.notes (created_at);

create trigger notes_sync_org
  before insert on public.notes
  for each row
  execute function public.sync_organization_id_from_profile();

alter table public.notes enable row level security;

create policy notes_select
  on public.notes for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy notes_insert
  on public.notes for insert
  to authenticated
  with check (organization_id = public.current_organization_id());
