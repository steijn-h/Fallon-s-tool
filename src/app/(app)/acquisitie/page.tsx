import { Percent, Target, TrendingUp, Users } from "lucide-react";

import { ImportDialog } from "@/components/shared/import-dialog";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { NewProspectDialog } from "@/components/shared/new-prospect-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { compactCurrency } from "@/lib/format";
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
        <StatCard
          label="Open pipeline"
          value={compactCurrency(totalPipelineValue)}
          delta={`${openProspects.length} open prospects`}
          icon={Target}
        />
        <StatCard
          label="Gewogen pipelinewaarde"
          value={compactCurrency(weightedPipelineValue)}
          delta="Waarde × slagingskans"
          icon={TrendingUp}
        />
        <StatCard label="Gemiddelde dealgrootte" value={compactCurrency(avgDealSize)} icon={Users} />
        <StatCard
          label="Conversieratio"
          value={`${conversionRate}%`}
          delta={`${wonProspects.length} gewonnen / ${lostProspects.length} verloren`}
          icon={Percent}
          tone={conversionRate >= 50 ? "success" : "default"}
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
