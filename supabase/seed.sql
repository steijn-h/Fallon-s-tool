-- Minimal, illustrative example data — NOT a full demo dataset. On purpose:
-- 2 prospects and 1 sponsorship, filled in richly enough (contacts, phone
-- numbers, a conversation log, a task, and — for the sponsorship —
-- deliverables, a payment, an activity and two assessment scores) that the
-- UI is immediately checkable end-to-end after `supabase db reset` /
-- running this file, without pretending to be real business data.
--
-- Owners are intentionally NOT seeded here — add your own team via
-- Instellingen after signing in.

insert into public.prospects (
  id, company, industry, website, stage_id, est_value, probability, notes,
  next_step, next_step_due, source, archetype_id, company_type, lead_warmth,
  organization_size, city, dmu_name, dmu_phone
) values
  (
    '10000000-0000-0000-0000-000000000001', 'Twentse Data Solutions', 'Tech',
    'https://twentsedatasolutions.example', 'mql', 18000, 45,
    'Groeiend softwarebedrijf, actief op zoek naar meer zichtbaarheid richting potentiële klanten.',
    'Vervolgafspraak inplannen met de marketingmanager', current_date + 10, 'Website',
    'calculerende-rationalist', 'B2B / SaaS', 'warm', '50-250', 'Enschede',
    'Marloes Bakker', '053-1234567'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'Bakkerij Van Rijn', 'Food & Beverage',
    'https://bakkerijvanrijn.example', 'prospect', 2500, 25,
    'Familiebedrijf in de binnenstad, enthousiast tijdens eerste kennismaking.',
    'Langsgaan voor een kop koffie', current_date + 5, 'Persoonlijk contact',
    'lokale-held', 'MKB / retail', 'lauw', '1-10', 'Enschede',
    'Rijk van Rijn', '053-7654321'
  );

insert into public.prospect_contacts (prospect_id, name, role, email, phone) values
  ('10000000-0000-0000-0000-000000000001', 'Marloes Bakker', 'Marketingmanager', 'marloes@twentsedatasolutions.example', '06-11223344'),
  ('10000000-0000-0000-0000-000000000002', 'Rijk van Rijn', 'Eigenaar', 'rijk@bakkerijvanrijn.example', '06-55667788');

insert into public.prospect_phone_numbers (prospect_id, name, number) values
  ('10000000-0000-0000-0000-000000000001', 'Algemeen', '053-1234567'),
  ('10000000-0000-0000-0000-000000000002', 'Winkel', '053-7654321');

insert into public.conversation_logs (prospect_id, log_date, contact_type, summary, content) values
  (
    '10000000-0000-0000-0000-000000000001', current_date - 7, 'teams',
    'Kennismakingsgesprek via Teams',
    'Marloes gaf aan dat ze dit jaar het marketingbudget willen uitbreiden. Ze zijn benieuwd naar meetbare resultaten.'
  ),
  (
    '10000000-0000-0000-0000-000000000002', current_date - 3, 'persoonlijk',
    'Langsgegaan in de winkel',
    'Rijk vertelde dat de bakkerij al 30 jaar in de familie is en graag méér wil doen voor de stad.'
  );

insert into public.tasks (prospect_id, title, description, due_date, priority) values
  (
    '10000000-0000-0000-0000-000000000001', 'Voorstel met KPI-onderbouwing opstellen',
    'Inclusief bereikcijfers en vergelijkbare cases.', current_date + 3, 'hoog'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'Instappakket samenstellen',
    null, current_date + 6, 'normaal'
  );

insert into public.sponsorships (
  id, prospect_id, company, industry, website, tier, status, value,
  start_date, end_date, notes, archetype_id, return_focus
) values (
  '20000000-0000-0000-0000-000000000001', null, 'Kennispark Groep', 'Tech',
  'https://kennisparkgroep.example', 'Gold', 'active', 15000,
  current_date - 90, current_date + 275,
  'Actieve sponsor, vooral geïnteresseerd in zichtbaarheid richting UT-studenten voor werving.',
  'talentenjager', 'ROA'
);

insert into public.sponsorship_contacts (sponsorship_id, name, role, email, phone) values
  ('20000000-0000-0000-0000-000000000001', 'Tom Hendriksen', 'HR-directeur', 'tom@kennisparkgroep.example', '06-99887766');

insert into public.deliverables (sponsorship_id, title, description, status, due_date, value) values
  ('20000000-0000-0000-0000-000000000001', 'Logo op wedstrijdshirt', 'Bedrukking voor het hele seizoen', 'delivered', current_date - 60, 3000),
  ('20000000-0000-0000-0000-000000000001', 'Stand tijdens thuiswedstrijd', 'Recruitmentstand bij de hoofdingang', 'in-progress', current_date + 20, 1500);

insert into public.payments (sponsorship_id, invoice_no, amount, due_date, paid_at, status) values
  ('20000000-0000-0000-0000-000000000001', '2026-0142', 7500, current_date - 30, current_date - 28, 'paid'),
  ('20000000-0000-0000-0000-000000000001', '2026-0198', 7500, current_date + 60, null, 'scheduled');

insert into public.activities (sponsorship_id, type, title, description, occurred_at) values
  ('20000000-0000-0000-0000-000000000001', 'contract', 'Sponsorschap aangemaakt', null, now() - interval '90 days'),
  ('20000000-0000-0000-0000-000000000001', 'meeting', 'Kwartaalgesprek', 'Voortgang deliverables besproken, positief.', now() - interval '20 days');

insert into public.assessment_scores (sponsorship_id, handle_id, score, note) values
  ('20000000-0000-0000-0000-000000000001', 'h-rendement', 70, 'Goede exposure, nog geen harde recruitmentcijfers.'),
  ('20000000-0000-0000-0000-000000000001', 'h-verbinding', 85, 'Zeer betrokken bij de club, komt zelf naar wedstrijden.');
