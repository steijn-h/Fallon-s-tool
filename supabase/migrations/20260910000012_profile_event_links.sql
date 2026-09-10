-- profile_event_links: links a profile to an event with a role (lead or
-- sponsor). Cross-checks that the profile and the event belong to the same
-- organization, on top of what RLS already guarantees for the caller.
-- Rollback: supabase/migrations_down/20260910000012_profile_event_links.sql

create or replace function public.sync_and_check_profile_event_link()
returns trigger
language plpgsql
as $$
declare
  profile_org_id uuid;
  event_org_id uuid;
begin
  select organization_id into profile_org_id from public.profiles where id = new.profile_id;
  select organization_id into event_org_id from public.events where id = new.event_id;

  if profile_org_id is null then
    raise exception 'profile % does not exist', new.profile_id;
  end if;

  if event_org_id is null then
    raise exception 'event % does not exist', new.event_id;
  end if;

  if profile_org_id <> event_org_id then
    raise exception 'profile % and event % belong to different organizations', new.profile_id, new.event_id;
  end if;

  new.organization_id = profile_org_id;
  return new;
end;
$$;

create table public.profile_event_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  role text not null check (role in ('lead', 'sponsor')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (profile_id, event_id)
);

create index profile_event_links_organization_id_idx
  on public.profile_event_links (organization_id);
create index profile_event_links_profile_id_idx
  on public.profile_event_links (profile_id);
create index profile_event_links_event_id_idx
  on public.profile_event_links (event_id);

create trigger profile_event_links_sync_org
  before insert on public.profile_event_links
  for each row
  execute function public.sync_and_check_profile_event_link();

alter table public.profile_event_links enable row level security;

create policy profile_event_links_select
  on public.profile_event_links for select
  to authenticated
  using (organization_id = public.current_organization_id());

create policy profile_event_links_insert
  on public.profile_event_links for insert
  to authenticated
  with check (organization_id = public.current_organization_id());

create policy profile_event_links_delete
  on public.profile_event_links for delete
  to authenticated
  using (organization_id = public.current_organization_id());
