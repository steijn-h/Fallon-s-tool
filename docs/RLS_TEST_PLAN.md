# RLS-testplan: multi-tenant isolatie + platform-admin

SponsorHub is sinds de "Fase 0"-uitbreiding weer multi-tenant: elke
organisatie krijgt haar eigen SponsorHub-portaal, met een eigen pakket
(a/b/c) dat door de platform-operator wordt toegekend via het
beheerportaal (`/beheer`). RLS moet hier drie dingen garanderen:

1. **Niemand die niet is ingelogd kan iets lezen of schrijven.**
2. **Een medewerker van organisatie X kan nooit data van organisatie Y
   zien of wijzigen** — ook niet via een directe tabel-query, een insert,
   of door een id te raden.
3. **Een platform-admin (het eigen beheer-account) kan wél overal bij**,
   maar alleen via het expliciete `platform_admins`-allowlist-mechanisme —
   niet via een gewone rol.

## Voorbereiding

1. Zorg dat de migraties zijn toegepast (`supabase db push` of, lokaal,
   `supabase db reset`).
2. Kopieer `.env.example` naar `.env.local` en vul de `anon key` in.

## Optie 1 — geautomatiseerd script (authenticatie-grens)

```bash
node --env-file=.env.local scripts/verify-rls.mjs
```

Dit controleert, zonder in te loggen, dat een anonieme cliënt nergens bij
kan en nergens in kan schrijven. Dit script test **niet** de
organisatie-isolatie (daarvoor zijn minimaal twee echte accounts in twee
verschillende organisaties nodig) — zie optie 2 daarvoor.

## Optie 2 — handmatig: organisatie-isolatie

1. Maak via `/beheer` twee organisaties aan (bijv. "Test A" en "Test B").
2. Maak twee staf-accounts aan via de Supabase-dashboard
   (Authentication → Add user), en koppel account A aan organisatie A en
   account B aan organisatie B via `/beheer/<org-id>`.
3. Log in als account A, maak een prospect aan.
4. Log uit, log in als account B. Bevestig dat je **niets** van organisatie
   A ziet (niet op het Dashboard, niet in Acquisitie, geen enkele pagina) —
   en dat organisatie B's eigen pipeline-stadia en handvatten er gewoon
   staan (die zijn automatisch aangemaakt bij het aanmaken van de
   organisatie).
5. Log in als het platform-admin-account (zie hieronder) en bevestig dat
   je wél data van beide organisaties ziet via `/beheer`.

Dit exacte scenario is bij het bouwen van deze functionaliteit al
rechtstreeks tegen een losse PostgreSQL-instantie doorgemeten (zie
"Wat al geverifieerd is" in de README) — dit is de handmatige herhaling
daarvan tegen je eigen Supabase-project.

## Optie 3 — losse SQL-check

In de Supabase SQL Editor, met "Run as" op de `anon`-rol (niet ingelogd):

```sql
select count(*) from public.prospects;
```

Dit moet altijd `0` teruggeven.

## Een platform-admin-account aanmaken

Er is bewust geen UI om jezelf platform-admin te maken (dat zou de hele
afscherming omzeilbaar maken). Dit kan alleen via de SQL Editor, als
postgres/service-role:

```sql
insert into public.platform_admins (user_id, note)
values ('<uuid van je eigen auth-account>', 'operator');
```

## Wat dit niet test

Fijnmazige rechten binnen één organisatie (bijv. "member mag alleen
lezen") bestaan nog niet — elke rol binnen een organisatie (owner, admin,
member) heeft nu nog gelijke leesrechten op alle tabellen van die
organisatie. Dat staat als latere fase op de backlog.
