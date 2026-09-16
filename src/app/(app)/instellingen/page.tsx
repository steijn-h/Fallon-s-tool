import type { CSSProperties } from "react";

import { DataResetCard } from "@/components/shared/data-reset-card";
import { OwnersSettingsCard } from "@/components/shared/owners-settings-card";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { YearTargetsForm } from "@/components/shared/year-targets-form";
import { Card, CardContent } from "@/components/ui/card";
import { compactCurrency } from "@/lib/format";
import { TIER_COLORS, type SponsorshipTier } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function InstellingenPage() {
  const supabase = await createClient();

  const [
    { data: owners },
    { data: targets },
    { data: prospects },
    { data: sponsorships },
    { data: payments },
  ] = await Promise.all([
    supabase.from("owners").select("*").order("name"),
    supabase.from("year_targets").select("*").eq("id", 1).single(),
    supabase.from("prospects").select("id, owner_id, industry"),
    supabase.from("sponsorships").select("id, owner_id, tier, value"),
    supabase.from("payments").select("amount, status"),
  ]);

  const counts: Record<string, { prospects: number; sponsorships: number }> = {};
  for (const owner of owners ?? []) counts[owner.id] = { prospects: 0, sponsorships: 0 };
  for (const p of prospects ?? []) {
    if (p.owner_id && counts[p.owner_id]) counts[p.owner_id]!.prospects += 1;
  }
  for (const s of sponsorships ?? []) {
    if (s.owner_id && counts[s.owner_id]) counts[s.owner_id]!.sponsorships += 1;
  }

  const branchCounts = new Map<string, number>();
  for (const p of prospects ?? []) {
    branchCounts.set(p.industry, (branchCounts.get(p.industry) ?? 0) + 1);
  }

  const tiers: SponsorshipTier[] = ["Platinum", "Gold", "Silver", "Bronze", "Partner"];
  const tierStats = tiers.map((tier) => {
    const items = (sponsorships ?? []).filter((s) => s.tier === tier);
    return { tier, count: items.length, value: items.reduce((sum, s) => sum + s.value, 0) };
  });

  const totalContractValue = (sponsorships ?? []).reduce((sum, s) => sum + s.value, 0);
  const totalCollected = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Instellingen" subtitle="Beheer eigenaren, targets en stamgegevens." />

      <OwnersSettingsCard owners={owners ?? []} counts={counts} />

      {targets ? <YearTargetsForm targets={targets} /> : null}

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Branches</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {[...branchCounts.entries()].map(([branch, count]) => (
              <span
                key={branch}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {branch} · {count}
              </span>
            ))}
            {branchCounts.size === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen prospects met een branche.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Sponsorship-pakketten</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-5">
            {tierStats.map((t) => (
              <div
                key={t.tier}
                style={{ "--tier-color": TIER_COLORS[t.tier] } as CSSProperties}
                className="rounded-md border p-2.5 border-[hsl(var(--tier-color)/0.3)] bg-[hsl(var(--tier-color)/0.08)]"
              >
                <p className="text-xs font-medium text-[hsl(var(--tier-color))]">{t.tier}</p>
                <p className="text-sm font-semibold">{t.count}</p>
                <p className="text-xs text-muted-foreground">{compactCurrency(t.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataResetCard
        prospectCount={(prospects ?? []).length}
        sponsorshipCount={(sponsorships ?? []).length}
        totalContractValue={totalContractValue}
        totalCollected={totalCollected}
      />
    </div>
  );
}
