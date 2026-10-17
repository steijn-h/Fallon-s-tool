# SponsorHub

Sponsoracquisitie- en -beheer-CRM. Multi-tenant: elke organisatie (club,
evenement, citymarketingpartij) krijgt haar eigen SponsorHub-portaal, met
een pakket (a/b/c) dat de platform-operator toekent via een los
beheerportaal (`/beheer`). Zie "Geschiedenis van dit project" onderaan voor
hoe dit zich verhoudt tot eerdere versies van dit platform.

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
4. **Een account aanmaken.** Er wordt bewust geen testgebruiker geseed.
   Zelfregistratie staat uit (`enable_signup = false` in
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
5. **Jezelf platform-admin maken** (eenmalig, alleen via SQL — zie
   `docs/RLS_TEST_PLAN.md`), zodat je bij `/beheer` kunt. Maak daar een
   organisatie aan en koppel je eigen account (of een ander account) erbij
   — zonder organisatie-koppeling kom je verder nergens in de app.
6. **App starten**
   ```bash
   npm run dev
   ```
   Log in: een platform-admin zonder eigen organisatie komt op `/beheer`
   terecht, een account met een organisatie op het Dashboard van die
   organisatie.

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

Zie `docs/RLS_TEST_PLAN.md` voor het volledige plan, inclusief hoe je
organisatie-isolatie handmatig test (het script zelf test alleen de
authenticatie-grens, niet "organisatie X versus Y" — dat vraagt om twee
echte accounts in twee organisaties).

## Structuur

```
supabase/
  migrations/        # elke migratie apart toepasbaar, genummerd op tijdstip
  migrations_down/   # bijbehorende rollback per migratie
  seed.sql           # 2 prospects + 1 sponsorschap, rijk ingevuld als voorbeeld
src/
  app/
    login/                       # inlogpagina + server actions
    geen-organisatie/             # getoond aan ingelogde accounts zonder organisatie
    beheer/                       # platform-admin-only: organisaties + licenties + leden
    (app)/                       # organisatie-deel van de app (layout = sidebar + auth-check)
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
    auth/            # sessiehelper (ingelogd? welke organisatie/rol/pakket? platform-admin?)
    actions/         # server actions — enige plek waar mutaties gebeuren
      platform-admin.ts # organisaties aanmaken/bewerken + leden koppelen (platform-admin-only)
docs/
  RLS_TEST_PLAN.md
scripts/
  verify-rls.mjs
```

## Belangrijke ontwerpkeuzes

- **Multi-tenant via `organization_id` op elke tabel.** Elke tenant-tabel
  (`prospects`, `sponsorships`, `owners`, `handles`, ...) heeft een
  `organization_id`-kolom met `default current_organization_id()` — een
  SECURITY DEFINER-functie die de organisatie van de ingelogde gebruiker
  opzoekt. Daardoor krijgt een gewone `insert` vanuit de app automatisch de
  juiste organisatie, zonder dat server actions dat expliciet moeten
  meegeven. RLS-policies zijn overal hetzelfde patroon: `using
  (organization_id = current_organization_id() or is_platform_admin())`.
- **`pipeline_stages.id` en `handles.id` blijven leesbare tekst-ids**
  (`'lead'`, `'h-rendement'`, ...), maar de primary key is nu
  `(organization_id, id)` in plaats van alleen `id` — elke organisatie
  krijgt zo haar eigen onafhankelijke set zonder dat bestaande waarden
  hernummerd moesten worden. `prospects.stage_id` en
  `assessment_scores.handle_id` zijn daardoor samengestelde foreign keys.
- **Eén platform-admin-allowlist (`platform_admins`), geen rollen-hack.**
  De platform-operator (jijzelf) zit in een tabel zonder enige RLS-policy —
  onbereikbaar via de normale API, alleen te wijzigen via de SQL Editor.
  `is_platform_admin()` wordt in élke policy als `or`-voorwaarde toegevoegd,
  dus een platform-admin ziet/bewerkt alles, in elke organisatie.
- **Pakket (a/b/c) wordt alleen door de platform-admin toegekend.**
  Organisaties kunnen hun eigen naam zien maar niet hun `package_type`
  wijzigen — dat is precies de "licentie" die de platform-operator
  uitgeeft via `/beheer`. Welke functies een pakket concreet ontgrendelt is
  nog niet uitgewerkt (dat volgt in een latere fase); nu wordt alleen het
  pakket zelf al vastgelegd en getoond.
- **Een nieuwe organisatie is nooit leeg.** Een trigger op `organizations`
  (`seed_organization_defaults`) zet bij het aanmaken automatisch de 6
  standaard pipeline-stadia, 8 standaard handvatten en een jaartargets-rij
  neer — zonder die stap zou een net aangemaakte organisatie een kapotte
  Acquisitie-pagina hebben (geen kolommen in de kanban).
- **"Owners" (dealverantwoordelijken) zijn bewust geen login-accounts.**
  `owners` blijft een losse, vrij te bewerken naamlijst per organisatie,
  los van `organization_members` (dat echte inlogaccounts met een rol
  koppelt). Een "owner" is een toewijzingslabel voor rapportage, geen
  account — dat onderscheid bestond al vóór multi-tenancy en is bewust niet
  samengevoegd om bestaande functionaliteit niet te breken.
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
`auth.users`/`auth.uid()`-stub en dezelfde table-grants die Supabase zelf
standaard aan `anon`/`authenticated` geeft (RLS is daar de enige
restrictie, net als in een echt Supabase-project):

1. Alle migraties — inclusief de sloop van het oorspronkelijke
   "Fallon's Tool"-schema, de single-tenant SponsorHub-opbouw, én de
   multi-tenant Fase-0-uitbreiding daarna — passen achter elkaar toe
   zonder fouten.
2. `supabase/seed.sql` laadt zonder fouten (met expliciete
   `organization_id` op elke rij — zie de toelichting in dat bestand).
3. **Organisatie-isolatie**: een medewerker van organisatie A krijgt 0
   rijen terug bij het bevragen van organisatie B's data (zelfs bij een
   expliciete `where organization_id = '<B>'`-filter), en omgekeerd. Een
   `insert` zonder opgegeven `organization_id` komt automatisch in de
   juiste organisatie terecht via de kolom-default.
4. **Platform-admin-bypass**: het platform-admin-account ziet en bevraagt
   data van beide test-organisaties probleemloos.
5. **Zelfbediening binnen de eigen organisatie**: een organisatie-owner
   kan zelf een nieuwe medewerker aan de eigen organisatie koppelen, maar
   krijgt een RLS-fout bij een poging dit bij een andere organisatie te
   doen, en kan het eigen `package_type` niet wijzigen (platform-admin-only).
6. Een nieuw aangemaakte organisatie krijgt automatisch haar eigen 6
   pipeline-stadia, 8 handvatten en jaartargets-rij (via de
   `seed_organization_defaults`-trigger).
7. Een anonieme (niet-ingelogde) cliënt krijgt overal 0 rijen terug en kan
   nergens in schrijven.
8. Alle migraties — ook de nieuwe Fase-0-migraties, inclusief het geval met
   meerdere organisaties tegelijk — draaien in omgekeerde volgorde weer
   schoon terug.

## Geschiedenis van dit project

Dit platform begon als een multi-tenant "sponsor- en
citymarketingportaal" met meerdere organisaties en drie verkooppakketten
(a/b/c). Die aanpak is tijdelijk losgelaten ten gunste van SponsorHub: één
single-tenant CRM voor één sportclub (het oude schema werd afgebroken via
migratie `20260916000019`). Vervolgens is multi-tenancy weer teruggebracht
("Fase 0", migraties vanaf `20261017000027`) — nu niet als het
oorspronkelijke citymarketing-datamodel, maar als een organisatielaag
*onder* SponsorHub: elke organisatie krijgt haar eigen SponsorHub-portaal,
met een pakket dat de platform-operator toekent via een los
beheerportaal (`/beheer`). De oude migraties van vóór de SponsorHub-pivot
zijn in de git-geschiedenis blijven staan (niet herschreven).
