# Rollback scripts

Supabase's CLI migration format only has "up" files. To keep every migration
individually reversible, each file in `supabase/migrations/<name>.sql` has a
matching rollback script here at `supabase/migrations_down/<name>.sql`.

Apply rollbacks in **reverse chronological order** (undo the newest migration
first) — later migrations reuse functions and tables created by earlier ones
(e.g. `sync_organization_id_from_profile()`, `public.profiles`), so rolling
back out of order will fail with a dependency error.

To roll back the most recent migration against a local Supabase instance:

```bash
psql "$DATABASE_URL" -f supabase/migrations_down/<timestamp>_<name>.sql
```
