-- Rollback for 20261017000029_multitenancy_prospects.sql
drop policy if exists prospect_phone_numbers_all on public.prospect_phone_numbers;
create policy prospect_phone_numbers_all
  on public.prospect_phone_numbers for all
  to authenticated
  using (true)
  with check (true);
alter table public.prospect_phone_numbers drop column organization_id;

drop policy if exists prospect_contacts_all on public.prospect_contacts;
create policy prospect_contacts_all
  on public.prospect_contacts for all
  to authenticated
  using (true)
  with check (true);
alter table public.prospect_contacts drop column organization_id;

drop policy if exists prospects_all on public.prospects;
create policy prospects_all
  on public.prospects for all
  to authenticated
  using (true)
  with check (true);

-- Only drop the composite FK here — the simple (pre-multi-tenant) one is
-- restored by 20261017000028's down, once pipeline_stages' primary key is
-- back to plain (id).
alter table public.prospects drop constraint prospects_stage_id_fkey;

alter table public.prospects drop column organization_id;
