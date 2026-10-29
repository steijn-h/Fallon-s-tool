delete from public.tasks where sponsorship_id is not null;

drop index if exists public.tasks_sponsorship_id_idx;

alter table public.tasks
  drop constraint if exists tasks_exactly_one_parent;

alter table public.tasks
  alter column prospect_id set not null;

alter table public.tasks
  drop column if exists sponsorship_id;
