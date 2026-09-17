# SponsorHub

Sponsoracquisitie- en -beheer-CRM voor een sportclub (Twente/Enschede-context).
Eén club, alle stafleden met gelijke, volledige toegang — geen
multi-tenant-/pakketstructuur (dat was een eerdere, vervangen versie van dit
platform; zie "Geschiedenis van dit project" onderaan).

## Stack

- Next.js (App Router), TypeScript strict
- Supabase: Postgres, Auth, Row-Level Security
- Tailwind CSS + handgeschreven shadcn/ui-stijl componenten
- recharts (grafieken), xlsx/SheetJS (Excel-import), sonner (toasts)
- Supabase SQL-migraties voor schemabeheer

## Snel starten

1. **Dependencies installeren**
   ```bash
   npm install
   ```
2. **Supabase-project.** Lokaal met Docker:
   ```bash
   supabase start
   supabase db reset   # past alle migraties toe + supabase/seed.sql
   ```
   Of gebruik een gratis cloudproject (zie "Zonder Docker" hieronder).
3. **Environment variabelen**
   ```bash
   cp .env.example .env.local
   # vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in
   ```
4. **Een staf-account aanmaken.** Er wordt bewust geen testgebruiker
   geseed. Zelfregistratie staat uit (`enable_signup = false` in
   `supabase/config.toml`) omdat dit een besloten, intern hulpmiddel is,
   geen publieke app — dus een account aanmaken kan niet via het
   inlogscherm zelf. Twee opties:
   - Via de Supabase-dashboard: Authentication → Add user.
   - Via het meegeleverde script (heeft de **service role key** nodig, niet
     de anon key — zet die alleen lokaal in `.env.local`, nooit committen):
     ```bash
     node --env-file=.env.local scripts/create-test-user.mjs jij@club.test EenSterkWachtwoord123
     ```
     Dit maakt direct een bevestigd account aan, zonder bevestigingsmail.
5. **App starten**
   ```bash
   npm run dev
   ```
   Log in en je komt op het Dashboard.

### Zonder Docker (Supabase Cloud + Vercel)

Werkt `supabase start` niet lekker op je machine, dan kan het project ook
volledig zonder lokale Docker draaien:

1. Maak een gratis project op [supabase.com](https://supabase.com).
2. Koppel dit project: `supabase login && supabase link --project-ref <ref>`
   (de ref is het stukje vóór `.supabase.co` in je project-URL).
3. Zet het schema erop: `supabase db push`.
4. Zet de voorbeelddata erin via de Supabase SQL Editor: plak de inhoud van
   `supabase/seed.sql` en klik Run.
5. Maak een staf-account aan (zie stap 4 hierboven) en vul `.env.local` met
   de cloud-project-URL en anon key.
6. Voor een publieke link: importeer de repository op
   [vercel.com](https://vercel.com) en zet dezelfde twee environment
   variabelen daar (type **Config**, niet **Secret** — zie de toelichting
   in de commit-geschiedenis als je wilt weten waarom dat uitmaakt).

## RLS verifiëren

```bash
node --env-file=.env.local scripts/verify-rls.mjs
```

Zie `docs/RLS_TEST_PLAN.md`. Kort samengevat: dit is een single-tenant app
(één club, alle staf gelijke rechten), dus RLS test hier niet "organisatie X
vs Y" maar simpelweg "niet ingelogd = geen toegang, punt". Dit is lokaal
tegen een losse Postgres-instantie bevestigd: een anonieme cliënt krijgt 0
rijen terug op elke tabel en kan nergens in schrijven; een ingelogde
gebruiker (ongeacht wie) kan gewoon bij alles.

## Structuur

```
supabase/
  migrations/        # elke migratie apart toepasbaar, genummerd op tijdstip
  migrations_down/   # bijbehorende rollback per migratie
  seed.sql           # 2 prospects + 1 sponsorschap, rijk ingevuld als voorbeeld
src/
  app/
    login/                       # inlogpagina + server actions
    (app)/                       # ingelogde deel van de app (layout = sidebar + auth-check)
      page.tsx                    # "/" — Dashboard
      acquisitie/                 # kanban-pipeline + Excel-import
      prospects/[id]/             # prospectdetail
      sponsorschappen/            # lijst + [id] detail
      beoordeling/                # lijst + [id] detail (handvatten-scores)
      archetypes/                 # de 6 archetypen + hun methodiek
      handvatten/                 # CRUD voor beoordelingscriteria
      instellingen/                # eigenaren, jaartargets, data-reset
  components/
    ui/            # generieke shadcn/ui-stijl primitives
    shared/         # alle overige, herbruikbare app-componenten
  lib/
    types.ts        # domeintypes (Prospect, Sponsorship, Handle, ...)
    archetypes.ts    # de 6 archetypen + hun volledige verkoopmethodiek (NL)
    format.ts        # currency/compactCurrency/formatDate/computeRenewalRate/...
    import-mapping.ts # kolom-naar-veld-heuristiek voor Excel-import
    supabase/        # browser/server clients + database.types.ts
    auth/            # sessiehelper (alleen: is iemand ingelogd)
    actions/         # server actions — enige plek waar mutaties gebeuren
docs/
  RLS_TEST_PLAN.md
scripts/
  verify-rls.mjs
```

## Belangrijke ontwerpkeuzes

- **Eén club, geen tenant-model.** Elke ingelogde gebruiker ziet en bewerkt
  alles. RLS-policies zijn daarom overal hetzelfde simpele patroon: `for all
  to authenticated using (true) with check (true)` — geen
  `organization_id`-vergelijkingen zoals in een multi-tenant opzet. Wie mag
  inloggen wordt geregeld via Supabase Auth zelf (accounts worden handmatig
  aangemaakt, zelfregistratie staat uit), niet via een rollen-tabel.
- **Archetypen zijn code, geen databasetabel.** De zes persona's
  (`src/lib/archetypes.ts`) bevatten lange, vaste Nederlandse
  methodiek-teksten — redactionele inhoud, geen tenant-data die via een
  scherm bewerkt hoeft te worden. `prospects.archetype_id` en
  `sponsorships.archetype_id` zijn tekstvelden met een `check`-constraint
  tegen deze vaste set van zes waarden, in plaats van een foreign key naar
  een tabel.
- **Handvatten (beoordelingscriteria) zijn wél een databasetabel** — die
  worden juist bewust door staf beheerd (toevoegen, hernoemen, wegen
  aanpassen) via het Handvatten-scherm.
- **`quality`-achtige rangordes als data, niet als code.** Net als de
  archetype-tekst is ook de weging tussen een handvat-score en het
  archetype van een sponsor (`archetypeScoreForMotivation` in
  `lib/archetypes.ts`) een pure functie op basis van vaste motivatiewaarden
  per archetype — makkelijk te lezen en aan te passen zonder de rest van de
  berekening te raken.
- **Geen localStorage.** Alle data staat in Postgres achter Supabase Auth;
  er is geen client-side state die de bron van waarheid is. Server
  Components lezen rechtstreeks (met RLS als enige toegangscontrole),
  Server Actions zijn de enige plek waar geschreven wordt.
- **Excel-import blijft clientside parsen, serverside schrijven.** Het
  bestand wordt in de browser gelezen met `xlsx` (kolommen + preview +
  mapping-UI), en pas de uiteindelijk gemapte rijen gaan naar de
  `importProspects`-server action — er wordt nooit een ruw bestand naar de
  server gestuurd.

## Bekende beperkingen / aandachtspunten

- **`xlsx`-pakket heeft een bekende, ongepatchte kwetsbaarheid** in de
  npm-registry-versie (prototype pollution / ReDoS,
  [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)).
  SheetJS publiceert gepatchte versies alleen via hun eigen CDN
  (`cdn.sheetjs.com`), niet via npm — en die host is vanuit deze
  bouwomgeving geblokkeerd door het netwerkbeleid, dus kon hier niet
  geïnstalleerd worden. Risico is beperkt (dit is een besloten, ingelogde
  interne tool — alleen staf uploadt bestanden, geen publieke upload-flow),
  maar wil je dit dichten: draai zelf, buiten deze omgeving,
  ```bash
  npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
  ```
  (of een nieuwere versie — check cdn.sheetjs.com voor de laatste), en
  commit de bijgewerkte `package-lock.json`.
- **`database.types.ts` is handmatig geschreven** (geen netwerktoegang tot
  een live Supabase-project in deze omgeving om `supabase gen types` te
  draaien). Vervang dit bestand door de CLI-output zodra je een project
  hebt gelinkt; de vorm is bewust identiek gehouden aan wat de CLI zou
  genereren.
- De UI zelf is hier getypecheckt (`npm run build` slaagt) en het
  datamodel + de migraties + RLS zijn rechtstreeks tegen een losse lokale
  Postgres-instantie doorgemeten (zie hieronder), maar nog niet in een
  browser tegen een live Supabase-instantie doorgeklikt — dat is de laatste
  stap voor jou, met de stappen onder "Snel starten" hierboven.

## Wat al geverifieerd is

Buiten deze sandbox (geen Docker, dus geen `supabase start`) is dit
rechtstreeks tegen een losse lokale PostgreSQL 16 getest, met een minimale
`auth.users`/`auth.uid()`-stub die het gedrag van Supabase nabootst:

1. Alle migraties (de sloop van het oude schema + alle nieuwe
   SponsorHub-tabellen) passen achter elkaar toe zonder fouten, op een
   database die eerder de volledige oude "Fallon's Tool"-schema had.
2. `supabase/seed.sql` (2 prospects, 1 sponsorschap, met alle gekoppelde
   contacten/taken/deliverables/betalingen/activiteiten/beoordelingen)
   laadt zonder fouten.
3. Een anonieme (niet-ingelogde) cliënt krijgt op elke tabel
   (`prospects`, `sponsorships`, `owners`, `handles`, `pipeline_stages`)
   0 rijen terug, en kan geen nieuwe rij aanmaken.
4. Een ingelogde gebruiker — ongeacht welke — kan gewoon alle tabellen
   bevragen en erin schrijven.
5. Alle migraties draaien in omgekeerde volgorde weer schoon terug.

## Geschiedenis van dit project

Dit platform begon als een multi-tenant "sponsor- en
citymarketingportaal" met meerdere organisaties en drie verkooppakketten
(a/b/c). Die aanpak is losgelaten ten gunste van SponsorHub: één
single-tenant CRM voor één sportclub. Het oude schema is afgebroken via
migratie `20260916000019`; de oude migraties zelf zijn in de
git-geschiedenis blijven staan (niet herschreven) zodat de eerdere aanpak
nog te reconstrueren is, mocht dat ooit nodig zijn.
