import { AddActivityForm } from "@/components/shared/add-activity-form";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  call: "Telefoongesprek",
  email: "E-mail",
  meeting: "Afspraak",
  note: "Notitie",
  contract: "Contract",
  payment: "Betaling",
  assessment: "Beoordeling",
};

export async function ActivitiesTimeline({ sponsorshipId }: { sponsorshipId: string }) {
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, type, title, description, occurred_at")
    .eq("sponsorship_id", sponsorshipId)
    .order("occurred_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <AddActivityForm sponsorshipId={sponsorshipId} />

      <div className="flex flex-col gap-2">
        {(activities ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen activiteiten.</p>
        ) : (
          (activities ?? []).map((a) => (
            <div key={a.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{a.title}</p>
                <span className="text-xs text-muted-foreground">{formatDateTime(a.occurred_at)}</span>
              </div>
              {a.description ? <p className="mt-1 text-sm text-muted-foreground">{a.description}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">{TYPE_LABELS[a.type] ?? a.type}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
