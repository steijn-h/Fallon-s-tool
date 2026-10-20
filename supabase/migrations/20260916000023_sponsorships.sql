-- sponsorships: an active/past sponsor relationship, optionally originating
-- from a prospect and optionally a renewal of a previous sponsorship
-- (self-referencing renewed_from_id).
-- Rollback: supabase/migrations_down/20260916000023_sponsorships.sql

create table public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects (id) on delete set null,
  renewed_from_id uuid references public.sponsorships (id) on delete set null,
  company text not null,
  industry text not null,
  website text,
  logo_color text not null default '0 72% 51%',
  tier text not null check (tier in ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner')),
  status text not null default 'concept' check (
    status in ('concept', 'contracted', 'active', 'completed', 'at-risk', 'cancelled')
  ),
  value numeric(12, 2) not null default 0,
  start_date date not null,
  end_date date not null,
  owner_id uuid references public.owners (id) on delete set null,
  notes text,
  tags text[] not null default '{}',
  archetype_id text check (
    archetype_id is null or archetype_id in (
      'calculerende-rationalist', 'lokale-held', 'netwerker-relatiebeheerder',
      'stadstrots-aanjager', 'talentenjager', 'vinkjes-zetter'
    )
  ),
  return_focus text check (
    return_focus is null or return_focus in ('ROI', 'ROO', 'ROE', 'ROA', 'ROCI', 'ROKI', 'ROK')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sponsorships_prospect_id_idx on public.sponsorships (prospect_id);
create index sponsorships_owner_id_idx on public.sponsorships (owner_id);
create index sponsorships_status_idx on public.sponsorships (status);

create trigger sponsorships_set_updated_at
  before update on public.sponsorships
  for each row
  execute function public.set_updated_at();

alter table public.sponsorships enable row level security;

create policy sponsorships_all
  on public.sponsorships for all
  to authenticated
  using (true)
  with check (true);

create table public.sponsorship_contacts (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text
);

create index sponsorship_contacts_sponsorship_id_idx on public.sponsorship_contacts (sponsorship_id);

alter table public.sponsorship_contacts enable row level security;

create policy sponsorship_contacts_all
  on public.sponsorship_contacts for all
  to authenticated
  using (true)
  with check (true);
