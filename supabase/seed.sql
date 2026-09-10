-- Realistic seed data for local development, covering all three packages.
-- Run with `supabase db reset` (applies migrations, then this file) against
-- a local Supabase instance. Every seeded user's password is:
--
--   Wachtwoord123!
--
-- See docs/RLS_TEST_PLAN.md for how to use these accounts to verify tenant
-- isolation between organizations.

-- ---------------------------------------------------------------------
-- Organizations (one per package)
-- ---------------------------------------------------------------------
insert into public.organizations (id, name, package_type) values
  ('11111111-1111-1111-1111-000000000001', 'Sportgala Events', 'a'),
  ('11111111-1111-1111-1111-000000000002', 'Verenigingsdiensten BV', 'b'),
  ('11111111-1111-1111-1111-000000000003', 'Citymarketing Regio Noord', 'c');

-- ---------------------------------------------------------------------
-- Auth users + identities (raw SQL insert, since this runs with superuser
-- privileges outside of GoTrue's signup API).
-- ---------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  u.email, crypt('Wachtwoord123!', gen_salt('bf')), now(),
  now(), '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name),
  now(), now(), '', '', '', ''
from (values
  ('22222222-2222-2222-2222-000000000001'::uuid, 'sanne@sportgala-events.test', 'Sanne de Vries'),
  ('22222222-2222-2222-2222-000000000002'::uuid, 'bram@sportgala-events.test', 'Bram Jansen'),
  ('22222222-2222-2222-2222-000000000003'::uuid, 'fatima@verenigingsdiensten.test', 'Fatima El Amrani'),
  ('22222222-2222-2222-2222-000000000004'::uuid, 'daan@citymarketing-noord.test', 'Daan Bakker'),
  ('22222222-2222-2222-2222-000000000005'::uuid, 'lotte@citymarketing-noord.test', 'Lotte Visser')
) as u(id, email, full_name);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', now(), now(), now()
from auth.users u
where u.id in (
  '22222222-2222-2222-2222-000000000001', '22222222-2222-2222-2222-000000000002',
  '22222222-2222-2222-2222-000000000003', '22222222-2222-2222-2222-000000000004',
  '22222222-2222-2222-2222-000000000005'
);

-- ---------------------------------------------------------------------
-- Organization membership
-- ---------------------------------------------------------------------
insert into public.organization_members (organization_id, user_id, role) values
  ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000001', 'owner'),
  ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000002', 'member'),
  ('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000003', 'owner'),
  ('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000004', 'owner'),
  ('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000005', 'member');

-- ---------------------------------------------------------------------
-- Lead sources (per organization catalog)
-- ---------------------------------------------------------------------
insert into public.lead_sources (id, organization_id, name) values
  ('33333333-1111-1111-1111-000000000001', '11111111-1111-1111-1111-000000000001', 'Website'),
  ('33333333-1111-1111-1111-000000000002', '11111111-1111-1111-1111-000000000001', 'Beurs'),
  ('33333333-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000002', 'Referral'),
  ('33333333-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000002', 'Koud contact'),
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-000000000003', 'Website'),
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-000000000003', 'Netwerkevent');

-- ---------------------------------------------------------------------
-- Archetypes (citymarketing only, minimal placeholder for later persona layer)
-- ---------------------------------------------------------------------
insert into public.archetypes (id, organization_id, name, description) values
  ('44444444-3333-3333-3333-000000000001', '11111111-1111-1111-1111-000000000003', 'Grote werkgever', 'Regionale werkgevers met >100 fte'),
  ('44444444-3333-3333-3333-000000000002', '11111111-1111-1111-1111-000000000003', 'Ondernemend MKB', 'Lokale MKB-ondernemers');

-- ---------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------
insert into public.profiles (
  id, organization_id, archetype_id, status, organization_name, contact_name,
  street, house_number, postal_code, city, phone, email, custom_fields,
  archived_at, created_by
) values
  ('55555555-1111-1111-1111-000000000001', '11111111-1111-1111-1111-000000000001', null, 'sponsor',
   'FC Middenveld', 'Peter Hendriks', 'Sportlaan', '12', '3511AB', 'Utrecht', '030-1234567',
   'peter@fcmiddenveld.test', '{"event_interest": "Zomerfestival 2026", "stand_wish": "Grote stand bij de ingang"}',
   null, '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000002', '11111111-1111-1111-1111-000000000001', null, 'lead',
   'Bakkerij De Korenaar', 'Marieke Smit', 'Marktstraat', '5', '3512CD', 'Utrecht', '030-7654321',
   'marieke@dekorenaar.test', '{"event_interest": "Wintergala 2025"}',
   null, '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000003', '11111111-1111-1111-1111-000000000001', null, 'inactive',
   'Oude Sponsor BV', 'Henk Mulder', null, null, null, 'Amersfoort', null, 'henk@oudesponsor.test', '{}',
   now() - interval '10 days', '22222222-2222-2222-2222-000000000001'),

  ('55555555-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000002', null, 'lead',
   'Buurtvereniging Zonnehof', 'Anja Kok', 'Zonnehofplein', '3', '3811AB', 'Amersfoort', '033-1112233',
   'anja@zonnehof.test', '{}', null, '22222222-2222-2222-2222-000000000003'),
  ('55555555-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000002', null, 'sponsor',
   'Cafe De Hoek', 'Wouter Bos', 'Kerkstraat', '20', '3812EF', 'Amersfoort', '033-4445566',
   'wouter@dehoek.test', '{}', null, '22222222-2222-2222-2222-000000000003'),

  ('55555555-3333-3333-3333-000000000001', '11111111-1111-1111-1111-000000000003',
   '44444444-3333-3333-3333-000000000001', 'sponsor', 'Regiobank Noord', 'Ingrid de Boer',
   'Bankplein', '1', '9711AA', 'Groningen', '050-1231234', 'ingrid@regiobanknoord.test',
   '{"sector": "Financiële dienstverlening", "region": "Groningen-stad"}', null,
   '22222222-2222-2222-2222-000000000004'),
  ('55555555-3333-3333-3333-000000000002', '11111111-1111-1111-1111-000000000003',
   '44444444-3333-3333-3333-000000000002', 'lead', 'Studio Vorm', 'Tim Dijkstra',
   'Ontwerplaan', '8', '9712BB', 'Groningen', '050-6547890', 'tim@studiovorm.test',
   '{"sector": "Creatieve industrie", "region": "Groningen-stad"}', null,
   '22222222-2222-2222-2222-000000000004'),
  ('55555555-3333-3333-3333-000000000003', '11111111-1111-1111-1111-000000000003', null, 'prospect',
   'GroenGoed Tuinen', 'Sara Huisman', 'Parkweg', '15', '9713CC', 'Haren', '050-9998877',
   'sara@groengoed.test', '{"sector": "Groenvoorziening", "region": "Haren"}', null,
   '22222222-2222-2222-2222-000000000004');

-- ---------------------------------------------------------------------
-- Lead sources per profile
-- ---------------------------------------------------------------------
insert into public.profile_lead_source (profile_id, lead_source_id, note, recorded_by) values
  ('55555555-1111-1111-1111-000000000001', '33333333-1111-1111-1111-000000000002', 'Ontmoet op de sponsorbeurs', '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000002', '33333333-1111-1111-1111-000000000001', 'Contactformulier website', '22222222-2222-2222-2222-000000000002'),
  ('55555555-2222-2222-2222-000000000001', '33333333-2222-2222-2222-000000000001', 'Doorverwezen door de wijkraad', '22222222-2222-2222-2222-000000000003'),
  ('55555555-3333-3333-3333-000000000001', '33333333-3333-3333-3333-000000000002', 'Kennisgemaakt tijdens netwerkevent', '22222222-2222-2222-2222-000000000004'),
  ('55555555-3333-3333-3333-000000000002', '33333333-3333-3333-3333-000000000001', 'Aanmelding via website', '22222222-2222-2222-2222-000000000005');

-- ---------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------
insert into public.tasks (profile_id, title, description, assigned_to, status, due_date, completed_at, created_by) values
  ('55555555-1111-1111-1111-000000000001', 'Sponsorcontract opsturen', 'Contract 2026 opstellen en versturen', '22222222-2222-2222-2222-000000000001', 'in_progress', current_date + 5, null, '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000001', 'Logo aanleveren voor drukwerk', null, '22222222-2222-2222-2222-000000000002', 'open', current_date + 10, null, '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000002', 'Intakegesprek plannen', null, '22222222-2222-2222-2222-000000000002', 'done', current_date - 3, now() - interval '3 days', '22222222-2222-2222-2222-000000000001'),
  ('55555555-2222-2222-2222-000000000001', 'Kennismakingsmail sturen', null, '22222222-2222-2222-2222-000000000003', 'open', current_date + 2, null, '22222222-2222-2222-2222-000000000003'),
  ('55555555-3333-3333-3333-000000000001', 'Jaarlijkse evaluatie inplannen', 'Bespreken van resultaten 2025', '22222222-2222-2222-2222-000000000004', 'open', current_date + 14, null, '22222222-2222-2222-2222-000000000004'),
  ('55555555-3333-3333-3333-000000000002', 'Voorstel citymarketingpakket opstellen', null, '22222222-2222-2222-2222-000000000005', 'in_progress', current_date + 7, null, '22222222-2222-2222-2222-000000000004');

-- ---------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------
insert into public.notes (profile_id, author_id, body, created_at) values
  ('55555555-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000001', 'Zeer enthousiast over vernieuwd sponsorpakket, wil graag uitbreiden naar hoofdsponsor.', now() - interval '20 days'),
  ('55555555-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000002', 'Logo en huisstijl ontvangen, ligt bij de drukker.', now() - interval '4 days'),
  ('55555555-2222-2222-2222-000000000001', '22222222-2222-2222-2222-000000000003', 'Eerste kennismaking gehad tijdens buurtborrel.', now() - interval '15 days'),
  ('55555555-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000004', 'Regiobank wil dit jaar het hoofdevenement sponsoren.', now() - interval '30 days');

-- ---------------------------------------------------------------------
-- Relationship score history (append-only)
-- ---------------------------------------------------------------------
insert into public.relationship_scores (profile_id, score_type, score, note, recorded_by, recorded_at) values
  ('55555555-1111-1111-1111-000000000001', 'relationship', 40, 'Eerste contact', '22222222-2222-2222-2222-000000000001', now() - interval '60 days'),
  ('55555555-1111-1111-1111-000000000001', 'relationship', 65, 'Sponsorcontract getekend', '22222222-2222-2222-2222-000000000001', now() - interval '25 days'),
  ('55555555-1111-1111-1111-000000000001', 'relationship', 80, 'Zeer actieve samenwerking', '22222222-2222-2222-2222-000000000002', now() - interval '2 days'),
  ('55555555-1111-1111-1111-000000000002', 'relationship', 30, 'Eerste kennismaking', '22222222-2222-2222-2222-000000000001', now() - interval '10 days'),
  ('55555555-2222-2222-2222-000000000001', 'relationship', 25, 'Nog in verkennende fase', '22222222-2222-2222-2222-000000000003', now() - interval '12 days'),
  ('55555555-3333-3333-3333-000000000001', 'relationship', 70, 'Langjarige partner', '22222222-2222-2222-2222-000000000004', now() - interval '40 days'),
  ('55555555-3333-3333-3333-000000000001', 'relationship', 85, 'Verlenging besproken', '22222222-2222-2222-2222-000000000004', now() - interval '1 days');

-- ---------------------------------------------------------------------
-- Events (pakket a en c gebruiken de evenementen-tab)
-- ---------------------------------------------------------------------
insert into public.events (id, organization_id, name, description, location, start_date, end_date, created_by) values
  ('66666666-1111-1111-1111-000000000001', '11111111-1111-1111-1111-000000000001', 'Zomerfestival 2026', 'Jaarlijks sportfestival', 'Sportpark Utrecht', current_date + 60, current_date + 62, '22222222-2222-2222-2222-000000000001'),
  ('66666666-1111-1111-1111-000000000002', '11111111-1111-1111-1111-000000000001', 'Wintergala 2025', 'Feestelijke afsluiting van het seizoen', 'Stadshal Utrecht', current_date - 90, current_date - 90, '22222222-2222-2222-2222-000000000001'),
  ('66666666-3333-3333-3333-000000000001', '11111111-1111-1111-1111-000000000003', 'Stadsfeest Noorderpark', 'Citymarketingevenement voor lokale ondernemers', 'Noorderpark Groningen', current_date + 45, current_date + 45, '22222222-2222-2222-2222-000000000004');

-- ---------------------------------------------------------------------
-- Profile <-> event links
-- ---------------------------------------------------------------------
insert into public.profile_event_links (profile_id, event_id, role, created_by) values
  ('55555555-1111-1111-1111-000000000001', '66666666-1111-1111-1111-000000000001', 'sponsor', '22222222-2222-2222-2222-000000000001'),
  ('55555555-1111-1111-1111-000000000002', '66666666-1111-1111-1111-000000000002', 'lead', '22222222-2222-2222-2222-000000000001'),
  ('55555555-3333-3333-3333-000000000001', '66666666-3333-3333-3333-000000000001', 'sponsor', '22222222-2222-2222-2222-000000000004'),
  ('55555555-3333-3333-3333-000000000002', '66666666-3333-3333-3333-000000000001', 'lead', '22222222-2222-2222-2222-000000000004');
