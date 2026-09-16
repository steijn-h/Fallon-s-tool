-- Rollback for 20260916000024_deliverables_activities_payments.sql
drop table if exists public.payments;
drop table if exists public.activities;
drop table if exists public.deliverables;
