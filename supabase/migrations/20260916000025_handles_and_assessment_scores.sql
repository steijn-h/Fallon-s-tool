-- handles: editable beoordelingscriteria (unlike the six fixed archetypes,
-- these ARE meant to be added/edited/removed by staff via the Handvatten
-- screen, hence a real table rather than code-defined content). Text ids
-- match the default seeded set (h-rendement, h-verbinding, ...) so seed
-- data and any future reference stay readable.
-- Rollback: supabase/migrations_down/20260916000025_handles_and_assessment_scores.sql

create table public.handles (
  id text primary key,
  name text not null,
  category text not null check (category in ('archetype', 'individual', 'both')),
  description text,
  weight integer not null default 3 check (weight >= 1 and weight <= 5),
  created_at timestamptz not null default now()
);

alter table public.handles enable row level security;

create policy handles_all
  on public.handles for all
  to authenticated
  using (true)
  with check (true);

-- Default beoordelingscriteria — app configuration, not demo business data,
-- so it's seeded here rather than in a separate seed script. Staff can
-- rename, reweigh, add or remove these via the Handvatten-scherm afterwards.
insert into public.handles (id, name, category, description, weight) values
  ('h-rendement', 'Rendement / ROI', 'both', 'Meet het financiële en zakelijke rendement van de sponsoring.', 5),
  ('h-verbinding', 'Verbinding & betrokkenheid', 'both', 'In hoeverre voelt de sponsor zich verbonden met de club en de regio.', 4),
  ('h-zichtbaarheid', 'Zichtbaarheid & merkexposure', 'both', 'Bereik en zichtbaarheid van het merk van de sponsor.', 4),
  ('h-dmu-bereik', 'DMU bereik & toegang', 'individual', 'Toegang tot en relatie met de daadwerkelijke beslissers.', 4),
  ('h-communautair', 'Maatschappelijke impact', 'both', 'Bijdrage aan maatschappelijke doelen in de regio.', 3),
  ('h-uitvoerbaarheid', 'Uitvoerbaarheid', 'individual', 'Hoe realistisch en behapbaar de samenwerking in de praktijk is.', 4),
  ('h-strategische-fit', 'Strategische fit', 'archetype', 'Aansluiting bij het archetype-profiel van de sponsor.', 5),
  ('h-besluitstijl', 'Aansluiting besluitvormingsstijl', 'archetype', 'Hoe goed onze aanpak aansluit bij de besluitvormingsstijl van de sponsor.', 4);

create table public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  handle_id text not null references public.handles (id) on delete cascade,
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sponsorship_id, handle_id)
);

create index assessment_scores_sponsorship_id_idx on public.assessment_scores (sponsorship_id);

create trigger assessment_scores_set_updated_at
  before update on public.assessment_scores
  for each row
  execute function public.set_updated_at();

alter table public.assessment_scores enable row level security;

create policy assessment_scores_all
  on public.assessment_scores for all
  to authenticated
  using (true)
  with check (true);
