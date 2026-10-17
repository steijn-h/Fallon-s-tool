import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function TakenPage() {
  const supabase = await createClient();

  const { data: openTasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, priority, prospect_id")
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  const prospectIds = [...new Set((openTasks ?? []).map((t) => t.prospect_id))];
  const { data: prospects } =
    prospectIds.length > 0
      ? await supabase.from("prospects").select("id, company").in("id", prospectIds)
      : { data: [] as { id: string; company: string }[] };
  const companyByProspectId = new Map((prospects ?? []).map((p) => [p.id, p.company]));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Openstaande taken" subtitle={`${(openTasks ?? []).length} taak/taken`} />

      <Card>
        <CardContent className="flex flex-col gap-2">
          {(openTasks ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen openstaande taken.</p>
          ) : (
            (openTasks ?? []).map((task) => (
              <Link
                key={task.id}
                href={`/prospects/${task.prospect_id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <span className="truncate">{task.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {companyByProspectId.get(task.prospect_id) ?? ""} · {formatDate(task.due_date)}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
