# RLS-testplan: afscherming tussen organisaties

Doel: aantonen dat een gebruiker van organisatie X nooit data van organisatie
Y kan zien of wijzigen — afgedwongen door Postgres Row Level Security, niet
door applicatiecode.

## Voorbereiding

1. Start een lokale Supabase-instantie en pas migraties + seed toe:
   ```bash
   supabase start
   supabase db reset
   ```
2. Kopieer `.env.example` naar `.env.local` en vul de lokale `anon key` in
   (`supabase status` toont deze).

De seed (`supabase/seed.sql`) maakt drie organisaties aan, één per pakket,
elk met eigen gebruikers. Alle wachtwoorden zijn `Wachtwoord123!`.

| Organisatie | Pakket | Gebruiker (rol) |
|---|---|---|
| Sportgala Events | a — Evenementen | sanne@sportgala-events.test (owner), bram@sportgala-events.test (member) |
| Verenigingsdiensten BV | b — Standaard | fatima@verenigingsdiensten.test (owner) |
| Citymarketing Regio Noord | c — Citymarketing | daan@citymarketing-noord.test (owner), lotte@citymarketing-noord.test (member) |

## Optie 1 — geautomatiseerd script

```bash
node --env-file=.env.local scripts/verify-rls.mjs
```

Het script logt in als een gebruiker van Sportgala Events (pakket a) én een
gebruiker van Verenigingsdiensten BV (pakket b), en controleert:

1. Elke gebruiker ziet in `profiles` uitsluitend rijen van de eigen organisatie.
2. Expliciet filteren op het `organization_id` van de andere organisatie levert 0 rijen op (geen foutmelding — RLS filtert stil).
3. De `organizations`-rij van de andere organisatie is niet leesbaar.
4. Een nieuw profiel aanmaken met het `organization_id` van de andere organisatie mislukt (RLS `WITH CHECK`-schending).
5. Een bestaand profiel van de andere organisatie bijwerken (op basis van het echte `id`) raakt 0 rijen.

Alle vijf moeten "PASS" tonen. Het script eindigt met exit-code 1 zodra er
iets faalt, zodat het ook in CI te gebruiken is.

## Optie 2 — handmatig via de UI

1. Log in de browser in als `sanne@sportgala-events.test`. Noteer de
   zichtbare profielen op `/profiles` (Sportgala Events: FC Middenveld,
   Bakkerij De Korenaar, Oude Sponsor BV — gearchiveerd).
2. Log uit en log in als `fatima@verenigingsdiensten.test`. Controleer dat
   geen van de Sportgala-profielen zichtbaar is, en dat alleen
   Verenigingsdiensten-profielen (Buurtvereniging Zonnehof, Cafe De Hoek)
   verschijnen.
3. Probeer een profiel-URL van de andere organisatie rechtstreeks te openen
   (kopieer bijvoorbeeld het `id` van "FC Middenveld" uit stap 1 en plak dat
   in `/profiles/<id>` terwijl je als Fatima bent ingelogd) — dit moet een
   "niet gevonden"-pagina geven, nooit de data zelf.
4. Herhaal desgewenst met de citymarketing-organisatie
   (`daan@citymarketing-noord.test`) om ook pakket c te controleren.

## Optie 3 — losse SQL-check (voor wie liever direct in de database kijkt)

Verbind met `psql` als de `authenticated`-rol met een user-JWT (via de
Supabase Studio SQL-editor met "Run as" ingesteld op een test-gebruiker), en
voer uit:

```sql
select organization_id, count(*) from public.profiles group by 1;
```

Dit mag altijd precies één `organization_id` teruggeven: die van de
ingelogde gebruiker.

## Wat dit *niet* test

Dit testplan verifieert tenant-isolatie (organisatie X vs. Y). Het test niet
de rolverschillen binnen één organisatie (owner/admin/member) — dat is een
kleinere, losstaande policy-check die met dezelfde aanpak (inloggen als een
`member`-gebruiker en een admin-only actie proberen) kan worden uitgevoerd.
