-- Adds a configurable "quality" ranking to lead_sources, so the stadsscore's
-- lead-source-quality criterion can read a plain data value (e.g. referral
-- ranks higher than cold outreach) instead of hardcoding a ranking in
-- application logic. 0-100, higher = better quality lead origin. Existing
-- rows default to a neutral 50 until an organization tunes them.
-- Rollback: supabase/migrations_down/20260910000017_lead_sources_quality_score.sql

alter table public.lead_sources
  add column quality_score numeric(5, 2) not null default 50 check (quality_score >= 0 and quality_score <= 100);
