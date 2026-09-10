import { LeadSourceForm } from "@/components/shared/lead-source-form";
import { createClient } from "@/lib/supabase/server";

export async function LeadSourceSection({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const [{ data: leadSources }, { data: current }] = await Promise.all([
    supabase.from("lead_sources").select("id, name").order("name"),
    supabase
      .from("profile_lead_source")
      .select("lead_source_id, note")
      .eq("profile_id", profileId)
      .maybeSingle(),
  ]);

  return (
    <LeadSourceForm
      profileId={profileId}
      leadSources={leadSources ?? []}
      currentLeadSourceId={current?.lead_source_id ?? null}
      currentNote={current?.note ?? ""}
    />
  );
}
