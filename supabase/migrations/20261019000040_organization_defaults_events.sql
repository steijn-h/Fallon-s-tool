-- Extends seed_organization_defaults() (20261017000035) so a brand new
-- organization also gets the default events + packages, not just pipeline
-- stages / handles / year targets — otherwise Sponsorschappen would have
-- nowhere to assign a new sponsorship to.
-- Rollback: supabase/migrations_down/20261019000040_organization_defaults_events.sql

create or replace function public.seed_organization_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_id uuid;
  event_name text;
begin
  insert into public.pipeline_stages (organization_id, id, label, color, type, sort_order) values
    (new.id, 'lead', 'Lead', '275 45% 62%', 'open', 0),
    (new.id, 'prospect', 'Prospect', '271 50% 55%', 'open', 1),
    (new.id, 'mql', 'MQL', '271 60% 48%', 'open', 2),
    (new.id, 'sql', 'SQL', '25 90% 55%', 'open', 3),
    (new.id, 'sponsor', 'Afspraak sponsor', '152 56% 42%', 'won', 4),
    (new.id, 'geen-interesse', 'Geen interesse', '0 72% 51%', 'lost', 5);

  insert into public.handles (organization_id, id, name, category, description, weight) values
    (new.id, 'h-rendement', 'Rendement / ROI', 'both', 'Meet het financiële en zakelijke rendement van de sponsoring.', 5),
    (new.id, 'h-verbinding', 'Verbinding & betrokkenheid', 'both', 'In hoeverre voelt de sponsor zich verbonden met de club en de regio.', 4),
    (new.id, 'h-zichtbaarheid', 'Zichtbaarheid & merkexposure', 'both', 'Bereik en zichtbaarheid van het merk van de sponsor.', 4),
    (new.id, 'h-dmu-bereik', 'DMU bereik & toegang', 'individual', 'Toegang tot en relatie met de daadwerkelijke beslissers.', 4),
    (new.id, 'h-communautair', 'Maatschappelijke impact', 'both', 'Bijdrage aan maatschappelijke doelen in de regio.', 3),
    (new.id, 'h-uitvoerbaarheid', 'Uitvoerbaarheid', 'individual', 'Hoe realistisch en behapbaar de samenwerking in de praktijk is.', 4),
    (new.id, 'h-strategische-fit', 'Strategische fit', 'archetype', 'Aansluiting bij het archetype-profiel van de sponsor.', 5),
    (new.id, 'h-besluitstijl', 'Aansluiting besluitvormingsstijl', 'archetype', 'Hoe goed onze aanpak aansluit bij de besluitvormingsstijl van de sponsor.', 4);

  insert into public.year_targets (organization_id) values (new.id);

  foreach event_name in array array['Integraal pakket', 'Schaatsbaan', 'Lights Up', 'Summer Sounds', 'Koningsdag', 'Intro']
  loop
    insert into public.events (organization_id, name)
    values (new.id, event_name)
    returning id into event_id;

    insert into public.event_packages (organization_id, event_id, name, color, sort_order) values
      (new.id, event_id, 'Platinum', '271 50% 72%', 0),
      (new.id, event_id, 'Gold', '25 95% 53%', 1),
      (new.id, event_id, 'Silver', '271 14% 60%', 2),
      (new.id, event_id, 'Bronze', '15 70% 48%', 3),
      (new.id, event_id, 'Partner', '271 40% 55%', 4);
  end loop;

  return new;
end;
$$;
