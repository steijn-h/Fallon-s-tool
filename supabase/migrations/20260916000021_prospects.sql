-- prospects: leads/prospects moving through the sales pipeline toward
-- becoming a sponsorship. archetype_id references a fixed, code-defined set
-- of six personas (src/lib/archetypes.ts) rather than a database table —
-- they're editorial content (long methodology write-ups), not tenant data —
-- so integrity is enforced with a check constraint against that fixed list
-- instead of a foreign key.
-- Rollback: supabase/migrations_down/20260916000021_prospects.sql

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  industry text not null,
  website text,
  logo_color text not null default '271 50% 55%',
  stage_id text not null references public.pipeline_stages (id) on delete restrict,
  est_value numeric(12, 2) not null default 0,
  probability numeric(5, 2) not null default 0 check (probability >= 0 and probability <= 100),
  owner_id uuid references public.owners (id) on delete set null,
  notes text,
  next_step text,
  next_step_due date,
  tags text[] not null default '{}',
  source text,
  archetype_id text check (
    archetype_id is null or archetype_id in (
      'calculerende-rationalist', 'lokale-held', 'netwerker-relatiebeheerder',
      'stadstrots-aanjager', 'talentenjager', 'vinkjes-zetter'
    )
  ),
  company_type text,
  lead_warmth text not null default 'koud' check (lead_warmth in ('koud', 'lauw', 'warm', 'heet')),
  success_ratio numeric(5, 2) not null default 0 check (success_ratio >= 0 and success_ratio <= 100),
  organization_size text check (organization_size in ('1-10', '11-50', '50-250', '250-1000', '1000+')),
  size_based_chance numeric(5, 2) not null default 0 check (size_based_chance >= 0 and size_based_chance <= 100),
  city text,
  dmu_name text,
  dmu_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospects_stage_id_idx on public.prospects (stage_id);
create index prospects_owner_id_idx on public.prospects (owner_id);

create trigger prospects_set_updated_at
  before update on public.prospects
  for each row
  execute function public.set_updated_at();

alter table public.prospects enable row level security;

create policy prospects_all
  on public.prospects for all
  to authenticated
  using (true)
  with check (true);

create table public.prospect_contacts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text
);

create index prospect_contacts_prospect_id_idx on public.prospect_contacts (prospect_id);

alter table public.prospect_contacts enable row level security;

create policy prospect_contacts_all
  on public.prospect_contacts for all
  to authenticated
  using (true)
  with check (true);

create table public.prospect_phone_numbers (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  name text not null,
  number text not null
);

create index prospect_phone_numbers_prospect_id_idx on public.prospect_phone_numbers (prospect_id);

alter table public.prospect_phone_numbers enable row level security;

create policy prospect_phone_numbers_all
  on public.prospect_phone_numbers for all
  to authenticated
  using (true)
  with check (true);
