-- "Ik zie de taken bij een sponsorschap niet terug... wat staat er niet
-- gepland, maar moet wel gebeuren?" — tasks were prospect-only. A task
-- now belongs to either a prospect or a sponsorship (never both, never
-- neither).
-- Rollback: supabase/migrations_down/20261028000047_tasks_on_sponsorships.sql

alter table public.tasks
  add column sponsorship_id uuid references public.sponsorships (id) on delete cascade;

alter table public.tasks
  alter column prospect_id drop not null;

alter table public.tasks
  add constraint tasks_exactly_one_parent check (
    (prospect_id is not null and sponsorship_id is null)
    or (prospect_id is null and sponsorship_id is not null)
  );

create index tasks_sponsorship_id_idx on public.tasks (sponsorship_id);
