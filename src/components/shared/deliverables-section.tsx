import { AddDeliverableForm } from "@/components/shared/add-deliverable-form";
import { DeliverableRow } from "@/components/shared/deliverable-row";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export async function DeliverablesSection({ sponsorshipId }: { sponsorshipId: string }) {
  const supabase = await createClient();
  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("id, title, description, status, due_date, value")
    .eq("sponsorship_id", sponsorshipId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AddDeliverableForm sponsorshipId={sponsorshipId} />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2">
        {(deliverables ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen deliverables.</p>
        ) : (
          (deliverables ?? []).map((d) => (
            <DeliverableRow key={d.id} sponsorshipId={sponsorshipId} deliverable={d} />
          ))
        )}
      </div>
    </div>
  );
}
