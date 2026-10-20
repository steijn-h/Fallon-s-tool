import { CalendarDays, SlidersHorizontal } from "lucide-react";

import { DataResetCard } from "@/components/shared/data-reset-card";
import { OwnersSettingsCard } from "@/components/shared/owners-settings-card";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionsSettingsCard, type MemberRow } from "@/components/shared/permissions-settings-card";
import { SettingsLinkCard } from "@/components/shared/settings-link-card";
import { YearTargetsForm } from "@/components/shared/year-targets-form";
import { createClient } from "@/lib/supabase/server";

export default async function InstellingenPage() {
  const supabase = await createClient();

  const [
    { data: owners },
    { data: targets },
    { data: prospects },
    { data: sponsorships },
    { data: payments },
    { data: members },
    { data: memberEmails },
    { count: handleCount },
    { count: eventCount },
  ] = await Promise.all([
    supabase.from("owners").select("*").order("name"),
    supabase.from("year_targets").select("*").single(),
    supabase.from("prospects").select("id, owner_id"),
    supabase.from("sponsorships").select("id, owner_id, value"),
    supabase.from("payments").select("amount, status"),
    supabase.from("organization_members").select("id, user_id, role, access_level"),
    supabase.rpc("list_own_organization_member_emails"),
    supabase.from("handles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  const counts: Record<string, { prospects: number; sponsorships: number }> = {};
  for (const owner of owners ?? []) counts[owner.id] = { prospects: 0, sponsorships: 0 };
  for (const p of prospects ?? []) {
    if (p.owner_id && counts[p.owner_id]) counts[p.owner_id]!.prospects += 1;
  }
  for (const s of sponsorships ?? []) {
    if (s.owner_id && counts[s.owner_id]) counts[s.owner_id]!.sponsorships += 1;
  }

  const totalContractValue = (sponsorships ?? []).reduce((sum, s) => sum + s.value, 0);
  const totalCollected = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const emailByUserId = new Map((memberEmails ?? []).map((m) => [m.user_id, m.email]));
  const memberRows: MemberRow[] = (members ?? []).map((m) => ({
    id: m.id,
    email: emailByUserId.get(m.user_id) ?? m.user_id,
    role: m.role,
    access_level: m.access_level,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Instellingen"
        subtitle="Beheer eigenaren, rechten, evenementen en stamgegevens."
      />

      <OwnersSettingsCard owners={owners ?? []} counts={counts} memberEmails={memberEmails ?? []} />

      <PermissionsSettingsCard members={memberRows} />

      <SettingsLinkCard
        href="/handvatten"
        icon={SlidersHorizontal}
        title="Beoordelingscriteria"
        description="Handvatten en wegingen aanpassen waarop de automatische beoordelingsscore wordt berekend."
        trailing={`${handleCount ?? 0} handvatten`}
      />

      <SettingsLinkCard
        href="/evenementen"
        icon={CalendarDays}
        title="Evenementen & pakketten"
        description="Evenementen, pakketprijzen per jaar, kostprijs en wederkerige prestaties beheer je nu bij Evenementen."
        trailing={`${eventCount ?? 0} evenementen`}
      />

      {targets ? <YearTargetsForm targets={targets} /> : null}

      <DataResetCard
        prospectCount={(prospects ?? []).length}
        sponsorshipCount={(sponsorships ?? []).length}
        totalContractValue={totalContractValue}
        totalCollected={totalCollected}
      />
    </div>
  );
}
