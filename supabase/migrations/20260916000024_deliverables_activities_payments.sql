-- deliverables, activities and payments: all children of one sponsorship,
-- shown as sections on the sponsorship detail page.
-- Rollback: supabase/migrations_down/20260916000024_deliverables_activities_payments.sql

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not-started' check (
    status in ('not-started', 'in-progress', 'delivered', 'overdue')
  ),
  due_date date,
  completed_at timestamptz,
  value numeric(12, 2),
  created_at timestamptz not null default now()
);

create index deliverables_sponsorship_id_idx on public.deliverables (sponsorship_id);

alter table public.deliverables enable row level security;

create policy deliverables_all
  on public.deliverables for all
  to authenticated
  using (true)
  with check (true);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'contract', 'payment', 'assessment')),
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index activities_sponsorship_id_occurred_at_idx
  on public.activities (sponsorship_id, occurred_at desc);

alter table public.activities enable row level security;

create policy activities_all
  on public.activities for all
  to authenticated
  using (true)
  with check (true);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid not null references public.sponsorships (id) on delete cascade,
  invoice_no text,
  amount numeric(12, 2) not null,
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'due', 'paid', 'overdue')),
  created_at timestamptz not null default now()
);

create index payments_sponsorship_id_idx on public.payments (sponsorship_id);

alter table public.payments enable row level security;

create policy payments_all
  on public.payments for all
  to authenticated
  using (true)
  with check (true);
