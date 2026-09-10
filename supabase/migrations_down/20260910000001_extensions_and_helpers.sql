-- Rollback for 20260910000001_extensions_and_helpers.sql
-- The pgcrypto extension is intentionally NOT dropped: other objects in the
-- database (gen_random_uuid defaults) may depend on it and dropping it here
-- could cascade further than this migration's own scope.

drop function if exists public.set_updated_at();
