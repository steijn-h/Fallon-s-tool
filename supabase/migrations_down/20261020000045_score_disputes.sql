drop policy if exists score_disputes_update on public.score_disputes;
drop policy if exists score_disputes_insert on public.score_disputes;
drop policy if exists score_disputes_select on public.score_disputes;

drop table if exists public.score_disputes;

alter table public.assessment_scores
  drop column if exists explanation;
