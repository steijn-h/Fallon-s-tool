-- Replaces sponsorships.tier (one global Platinum/Gold/Silver/Bronze/Partner
-- list, shared across everything) with event_package_id: every
-- sponsorship now belongs to one package, which belongs to one event.
--
-- Backfill: every organization that already exists at this point (there is
-- no retroactive trigger run for organizations created before this
-- migration) gets an "Integraal pakket" event with the old tier names as
-- its packages (same colors the old TIER_COLORS used) — whether or not it
-- has sponsorships yet, so a fresh project's seed data has somewhere valid
-- to point at. Any existing sponsorships get pointed at the package
-- matching their current tier, keeping that information instead of losing it.
-- Rollback: supabase/migrations_down/20261019000039_sponsorships_event_package.sql

alter table public.sponsorships
  add column event_package_id uuid references public.event_packages (id) on delete restrict;

do $$
declare
  org record;
  fallback_event_id uuid;
  platinum_id uuid;
  gold_id uuid;
  silver_id uuid;
  bronze_id uuid;
  partner_id uuid;
begin
  for org in select id as organization_id from public.organizations loop
    insert into public.events (organization_id, name)
    values (org.organization_id, 'Integraal pakket')
    returning id into fallback_event_id;

    insert into public.event_packages (organization_id, event_id, name, color, sort_order)
    values (org.organization_id, fallback_event_id, 'Platinum', '271 50% 72%', 0)
    returning id into platinum_id;
    insert into public.event_packages (organization_id, event_id, name, color, sort_order)
    values (org.organization_id, fallback_event_id, 'Gold', '25 95% 53%', 1)
    returning id into gold_id;
    insert into public.event_packages (organization_id, event_id, name, color, sort_order)
    values (org.organization_id, fallback_event_id, 'Silver', '271 14% 60%', 2)
    returning id into silver_id;
    insert into public.event_packages (organization_id, event_id, name, color, sort_order)
    values (org.organization_id, fallback_event_id, 'Bronze', '15 70% 48%', 3)
    returning id into bronze_id;
    insert into public.event_packages (organization_id, event_id, name, color, sort_order)
    values (org.organization_id, fallback_event_id, 'Partner', '271 40% 55%', 4)
    returning id into partner_id;

    update public.sponsorships
    set event_package_id = case tier
      when 'Platinum' then platinum_id
      when 'Gold' then gold_id
      when 'Silver' then silver_id
      when 'Bronze' then bronze_id
      when 'Partner' then partner_id
    end
    where organization_id = org.organization_id;
  end loop;
end $$;

alter table public.sponsorships
  alter column event_package_id set not null,
  drop column tier;

create index sponsorships_event_package_id_idx on public.sponsorships (event_package_id);
