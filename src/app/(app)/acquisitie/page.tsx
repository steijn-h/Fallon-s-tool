import { Percent, Target, TrendingUp, Users } from "lucide-react";

import { ClickableStatCard } from "@/components/shared/clickable-stat-card";
import { ImportDialog } from "@/components/shared/import-dialog";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { NewProspectDialog } from "@/components/shared/new-prospect-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { compactCurrency, currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AcquisitiePage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;
  const supabase = await createClient();

  const [{ data: prospects }, { data: stages }, { data: owners }] = await Promise.all([
    supabase
      .from("prospects")
      .select(
        "id, company, industry, city, stage_id, est_value, probability, owner_id, lead_warmth, organization_size, company_type, archetype_id",
      )
      .order("created_at", { ascending: false }),
    supabase.from("pipeline_stages").select("*").order("sort_order"),
    supabase.from("owners").select("*").order("name"),
  ]);

  const stageTypeById = new Map((stages ?? []).map((s) => [s.id, s.type]));
  const openProspects = (prospects ?? []).filter((p) => stageTypeById.get(p.stage_id) === "open");
  const wonProspects = (prospects ?? []).filter((p) => stageTypeById.get(p.stage_id) === "won");
  const lostProspects = (prospects ?? []).filter((p) => stageTypeById.get(p.stage_id) === "lost");

  const totalPipelineValue = openProspects.reduce((sum, p) => sum + p.est_value, 0);
  const weightedPipelineValue = openProspects.reduce((sum, p) => sum + (p.est_value * p.probability) / 100, 0);
  const avgDealSize = openProspects.length > 0 ? totalPipelineValue / openProspects.length : 0;
  const decidedCount = wonProspects.length + lostProspects.length;
  const conversionRate = decidedCount > 0 ? Math.round((wonProspects.length / decidedCount) * 100) : 0;

  const toRow = (p: (typeof openProspects)[number]) => ({
    label: p.company,
    value: currency(p.est_value),
    href: `/prospects/${p.id}`,
  });
  const openPipelineRows = [...openProspects].sort((a, b) => b.est_value - a.est_value).map(toRow);
  const avgDealRows = [...openProspects].sort((a, b) => b.est_value - a.est_value).map(toRow);
  const conversionRows = [
    ...wonProspects.map((p) => ({ ...toRow(p), value: `Gewonnen · ${currency(p.est_value)}` })),
    ...lostProspects.map((p) => ({ ...toRow(p), value: `Verloren · ${currency(p.est_value)}` })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Acquisitie"
        subtitle="Volg prospects door de pipeline heen."
        actions={
          <>
            <ImportDialog />
            <NewProspectDialog stages={stages ?? []} owners={owners ?? []} />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ClickableStatCard
          label="Open pipeline"
          value={compactCurrency(totalPipelineValue)}
          delta={`${openProspects.length} open prospects`}
          icon={<Target className="size-5" />}
          detailTitle="Open prospects"
          rows={openPipelineRows}
        />
        <ClickableStatCard
          label="Gewogen pipelinewaarde"
          value={compactCurrency(weightedPipelineValue)}
          delta="Waarde × slagingskans"
          icon={<TrendingUp className="size-5" />}
          detailTitle="Open prospects (gewogen op slagingskans)"
          rows={[...openProspects]
            .sort((a, b) => b.est_value * b.probability - a.est_value * a.probability)
            .map((p) => ({ label: p.company, value: `${currency((p.est_value * p.probability) / 100)} (${p.probability}%)`, href: `/prospects/${p.id}` }))}
        />
        <ClickableStatCard
          label="Gemiddelde dealgrootte"
          value={compactCurrency(avgDealSize)}
          icon={<Users className="size-5" />}
          detailTitle="Open prospects (op waarde)"
          rows={avgDealRows}
        />
        <ClickableStatCard
          label="Conversieratio"
          value={`${conversionRate}%`}
          delta={`${wonProspects.length} gewonnen / ${lostProspects.length} verloren`}
          icon={<Percent className="size-5" />}
          tone={conversionRate >= 50 ? "success" : "default"}
          detailTitle="Gewonnen en verloren prospects"
          rows={conversionRows}
        />
      </div>

      <KanbanBoard
        prospects={prospects ?? []}
        stages={stages ?? []}
        owners={owners ?? []}
        initialIndustry={industry}
      />
    </div>
  );
}
