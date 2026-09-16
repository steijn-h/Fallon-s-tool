# RLS-testplan: alleen ingelogde staf heeft toegang

SponsorHub is een single-tenant app voor één club: elke ingelogde
staf-account heeft gelijke, volledige toegang tot alle data. Er is dus geen
"organisatie X versus Y"-afscherming zoals in een multi-tenant systeem — wat
RLS hier moet garanderen is simpeler maar net zo belangrijk: **niemand die
niet is ingelogd kan ook maar iets lezen of schrijven.**

## Voorbereiding

1. Zorg dat de migraties zijn toegepast (`supabase db push` of, lokaal,
   `supabase db reset`).
2. Kopieer `.env.example` naar `.env.local` en vul de `anon key` in.

## Optie 1 — geautomatiseerd script

```bash
node --env-file=.env.local scripts/verify-rls.mjs
```

Dit controleert, zonder in te loggen:

1. Een anonieme cliënt krijgt 0 rijen terug bij het lezen van `prospects`,
   `sponsorships`, `owners`, `handles` en `pipeline_stages`.
2. Een anonieme cliënt kan geen nieuwe rij in `prospects` aanmaken.

Wil je ook de andere kant bevestigen (een ingelogde gebruiker kan wél bij de
data), geef dan een echt staf-account mee:

```bash
TEST_USER_EMAIL=jij@club.test TEST_USER_PASSWORD=... \
  node --env-file=.env.local scripts/verify-rls.mjs
```

Dan wordt ook gecontroleerd dat dat account alle tabellen zonder RLS-fout
kan bevragen.

## Optie 2 — handmatig via de UI

1. Open de site **uitgelogd** (of in een incognitovenster) en probeer een
   URL binnen de app te openen, bijvoorbeeld `/acquisitie`. Je moet naar
   `/login` worden gestuurd, nooit data te zien krijgen.
2. Log in met een staf-account en bevestig dat je gewoon bij alle
   onderdelen kunt (Dashboard, Acquisitie, Sponsorschappen, etc.).

## Optie 3 — losse SQL-check

In de Supabase SQL Editor, met "Run as" op de `anon`-rol (niet ingelogd):

```sql
select count(*) from public.prospects;
```

Dit moet altijd `0` teruggeven — nooit een foutmelding over een
niet-bestaande tabel, en nooit een aantal groter dan 0.

## Wat dit niet test

Dit testplan verifieert de authenticatie-grens (ingelogd vs. niet). Alle
ingelogde stafleden hebben bewust gelijke rechten — er is geen rollen- of
organisatiescheiding meer om te testen, in tegenstelling tot een eerdere,
inmiddels vervangen versie van dit platform.
