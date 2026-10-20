-- Rollback for 20261019000039_sponsorships_event_package.sql
-- Best-effort: maps back to tier by package name where it matches one of
-- the five original values; anything else (packages renamed or added
-- after this migration shipped) falls back to 'Partner' rather than
-- failing the rollback outright.
alter table public.sponsorships
  add column tier text check (tier in ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'));

update public.sponsorships s
set tier = coalesce(
  (select ep.name from public.event_packages ep
   where ep.id = s.event_package_id and ep.name in ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner')),
  'Partner'
);

alter table public.sponsorships
  alter column tier set not null,
  drop column event_package_id;
