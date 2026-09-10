-- Extensions and generic helper objects shared by later migrations.
-- Rollback: supabase/migrations_down/20260910000001_extensions_and_helpers.sql

create extension if not exists "pgcrypto";

-- Generic trigger: keeps an `updated_at` column current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
