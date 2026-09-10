# Sponsor- en citymarketingportaal — fundering

Fundament van een webportaal dat organisaties duurzaam bindt aan
citymarketingorganisaties en evenementen. Verkocht als drie losstaande
pakketten (a — Evenementen, b — Standaard, c — Citymarketing) op één
gedeeld, generiek datamodel.

## Stack

- Next.js (App Router), TypeScript strict
- Supabase: Postgres, Auth, Row-Level Security
- Tailwind CSS + handgeschreven shadcn/ui-stijl componenten
- Supabase SQL-migraties voor schemabeheer (zie "Waarom Supabase-migraties
  i.p.v. Drizzle" hieronder)

## Snel starten

1. **Dependencies installeren**
   ```bash
   npm install
   ```
2. **Lokale Supabase starten** (vereist Docker)
   ```bash
   supabase start
   supabase db reset   # past alle migraties toe + supabase/seed.sql
   ```
   `supabase status` toont de lokale API-url en de `anon key`.
3. **Environment variabelen**
   ```bash
   cp .env.example .env.local
   # vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in
   ```
4. **App starten**
   ```bash
   npm run dev
   ```
   Log in met een van de seed-gebruikers (zie hieronder), wachtwoord voor
   iedereen: `Wachtwoord123!`.

| Organisatie | Pakket | Gebruiker |
|---|---|---|
| Sportgala Events | a — Evenementen | sanne@sportgala-events.test |
| Verenigingsdiensten BV | b — Standaard | fatima@verenigingsdiensten.test |
| Citymarketing Regio Noord | c — Citymarketing | daan@citymarketing-noord.test |

## RLS verifiëren

```bash
node --env-file=.env.local scripts/verify-rls.mjs
```

Zie `docs/RLS_TEST_PLAN.md` voor het volledige testplan (geautomatiseerd,
via de UI, en via losse SQL-checks). Dit script en het schema zijn buiten
deze sandbox al één keer end-to-end doorgemeten tegen een losse lokale
Postgres (alle 13 migraties + rollbacks + seed + cross-org isolatie) — zie
"Wat al geverifieerd is" onderaan dit document.

## Structuur

```
supabase/
  migrations/        # elke migratie apart toepasbaar, genummerd op tijdstip
  migrations_down/   # bijbehorende rollback per migratie (zie README daar)
  seed.sql           # testdata voor alle drie pakketten
src/
  app/
    login/                    # inlogpagina + server actions
    (portal)/                 # ingelogde deel van de app (layout = nav + auth-check)
      profiles/                # lijst, nieuw, detail met tabs
      events/                  # evenementenoverzicht (alleen pakket a/c)
  components/
    ui/            # generieke shadcn/ui-stijl primitives (Button, Input, Tabs, ...)
    shared/         # gedeelde, pakket-onafhankelijke portaalcomponenten
    packages/
      a/            # UI die uniek is voor pakket a (Evenementen)
      b/            # UI die uniek is voor pakket b (Standaard)
      c/            # UI die uniek is voor pakket c (Citymarketing)
  lib/
    supabase/       # browser/server clients + database.types.ts
    auth/           # sessie-/organisatie-resolutie
    packages/       # features.ts — centrale pakket→velden/tabs-config
    actions/        # server actions (enige plek waar mutaties gebeuren)
docs/
  RLS_TEST_PLAN.md
scripts/
  verify-rls.mjs
```

`lib/packages/features.ts` is de **enige** plek die bepaalt welke tabs en
velden een pakket laat zien. Nieuwe functionaliteit voor bijvoorbeeld pakket
c hoort in `components/packages/c/` en `features.ts` — dat raakt pakket a en
b niet.

## Belangrijke ontwerpkeuzes

- **`profiles.custom_fields` (jsonb)** draagt pakketspecifieke velden (bv.
  `sector`/`region` voor citymarketing, `event_interest`/`stand_wish` voor
  evenementen) zonder dat het schema per pakket hoeft te veranderen. Een
  vierde pakket of een extra veld op een bestaand pakket is dan een wijziging
  in `features.ts`, geen migratie.
- **`organization_id` is gedenormaliseerd** op elke tabel die aan een profiel
  hangt (tasks, notes, relationship_scores, profile_lead_source,
  profile_event_links), automatisch gevuld door een `BEFORE INSERT`-trigger
  vanuit het gekoppelde profiel. Daardoor is elke RLS-policy een simpele
  vlakke check (`organization_id = current_organization_id()`) in plaats van
  een join door `profiles` — makkelijker te controleren en sneller.
- **`relationship_scores` is een append-only geschiedenis**, geen los veld
  met een huidige waarde. "Aanpassen" van een score = een nieuwe rij
  toevoegen; niets wordt overschreven. `score_type` laat nu al `city` en
  `sponsor` toe naast `relationship`, zodat de latere stads- en
  sponsorscore-berekeningen (nadrukkelijk buiten scope van deze fase)
  dezelfde tabel kunnen hergebruiken zonder schemawijziging.
- **`archetypes`** is bewust minimaal: alleen de tabel en de nullable relatie
  vanuit `profiles`. Geen matching-logica — dat is een latere fase.
- **Geen hard delete.** Profielen worden gearchiveerd (`archived_at`), nooit
  verwijderd. Notities en scores zijn append-only (geen UPDATE/DELETE-policy).
  Dat is zowel functioneel gewenst (audit trail) als een simpelere RLS-policy
  set.
- **`organization_members`** koppelt precies één organisatie aan elke
  gebruiker (`user_id` is `UNIQUE`) met een rol (`owner`/`admin`/`member`).
  `email`/`full_name` staan hier gedenormaliseerd op (via een trigger vanuit
  `auth.users`, dat zelf niet los opvraagbaar is via de Supabase REST-laag) —
  nodig om "toegewezen aan" en "auteur" leesbaar te tonen in de UI.

## Waarom Supabase-migraties i.p.v. Drizzle

De opdracht liet de keuze open. Voor een schema dat leunt op uitgebreide,
per-tabel RLS-policies en trigger-gebaseerde integriteitschecks (zoals de
organization_id-synchronisatie hierboven) is rechtstreeks SQL leesbaarder en
minder foutgevoelig dan het via een ORM-DSL uitdrukken en er dan op
vertrouwen dat de gegenereerde SQL exact klopt. `database.types.ts` is
(vooralsnog handmatig, zie het bestand zelf) in dezelfde vorm geschreven als
`supabase gen types typescript` zou opleveren, dus is drop-in te vervangen
zodra er een bereikbaar Supabase-project is.

## Bekende beperkingen van deze fase

- `database.types.ts` is handmatig geschreven (geen netwerktoegang tot een
  Supabase-project in de bouwomgeving om `supabase gen types` te draaien).
  Vervang dit bestand door de CLI-output zodra je een project hebt gelinkt;
  de vorm is bewust identiek gehouden.
- De UI is end-to-end gebouwd en getypecheckt (`npm run build` slaagt), maar
  in deze omgeving niet in de browser doorlopen tegen een echte, draaiende
  Supabase-instantie (geen Docker-daemon beschikbaar in deze sandbox). Het
  datamodel, alle 13 migraties, de rollbacks en de RLS-policies zijn wel
  rechtstreeks tegen een lokale Postgres-instantie doorgemeten (zie
  hieronder) — de browser-UI zelf verdient een keer doorklikken door jou of
  in een omgeving met Docker voor je live gaat.
- Alles wat in de opdracht onder "nadrukkelijk buiten scope" staat
  (stadsscore/sponsorscore-berekening, matching, dashboards,
  sponsor-uitnodigingsflow, facturatie, externe integraties,
  beheerderspagina) is bewust niet gebouwd, maar het datamodel is er expliciet
  op ingericht (zie "Belangrijke ontwerpkeuzes") zodat die fasen later geen
  schema-omgooi vereisen.

## Wat al geverifieerd is (ondanks de Docker-beperking van deze sandbox)

Omdat deze sandbox geen Docker heeft (dus geen `supabase start`), zijn de
migraties + seed + RLS rechtstreeks tegen een losse lokale PostgreSQL 16
getest met een minimale `auth.users`/`auth.uid()`-stub die het gedrag van
Supabase nabootst:

1. Alle 13 migraties passen achter elkaar toe zonder fouten.
2. `supabase/seed.sql` laadt zonder fouten (incl. de triggers die
   `organization_id` automatisch vullen en de cross-org-check op
   `profile_event_links`).
3. Als gebruiker van Sportgala Events (pakket a): ziet alleen de 3 eigen
   profielen en de eigen organisatierij; een directe query op het
   `organization_id` van Verenigingsdiensten BV levert 0 rijen op; een
   `INSERT` met dat `organization_id` wordt geweigerd door RLS; een
   `UPDATE` op een profiel van die organisatie raakt 0 rijen.
4. Als gebruiker van Verenigingsdiensten BV (pakket b): ziet alleen de 2
   eigen profielen en de eigen organisatierij.
5. Een `profile_event_links`-insert die een profiel en evenement uit
   verschillende organisaties koppelt, wordt geweigerd door de trigger.
6. Alle 13 rollback-scripts (in omgekeerde volgorde) draaien schoon terug
   tot een lege `public`-schema, mét de seed-data nog in de database.

Dit dekt de kern van de oplevercriteria (RLS-afscherming, omkeerbare
migraties) op databaseniveau. Doorklikken in de browser met een echte
Supabase-instantie (stap "Snel starten" hierboven) blijft de laatste stap
om ook de UI zelf te bevestigen.
