-- Every table that needs at least some rows to be usable (pipeline_stages,
-- handles, year_targets) got its defaults seeded directly in its own
-- creation migration, back when there was only ever one organization. Now
-- that organizations are created at runtime (via the platform admin
-- portal), a brand new organization needs the same defaults seeded for it
-- automatically, or its Acquisitie/Beoordeling/Dashboard pages would be
-- empty and effectively broken on first login. A trigger guarantees this
-- can't be forgotten by whichever code path creates the organization.
-- Rollback: supabase/migrations_down/20261017000035_organization_defaults_trigger.sql

create or replace function public.seed_organization_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

  return new;
end;
$$;

revoke all on function public.seed_organization_defaults() from public;

create trigger organizations_seed_defaults
  after insert on public.organizations
  for each row
  execute function public.seed_organization_defaults();
