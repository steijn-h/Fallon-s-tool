import { ImportDialog } from "@/components/shared/import-dialog";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { NewProspectDialog } from "@/components/shared/new-prospect-dialog";
import { PageHeader } from "@/components/shared/page-header";
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

      <KanbanBoard
        prospects={prospects ?? []}
        stages={stages ?? []}
        owners={owners ?? []}
        initialIndustry={industry}
      />
    </div>
  );
}
