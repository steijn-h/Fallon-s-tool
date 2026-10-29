import { AddConversationLogForm } from "@/components/shared/add-conversation-log-form";
import { DeleteLogButton } from "@/components/shared/delete-log-button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const CONTACT_TYPE_LABELS: Record<string, string> = {
  telefoon: "Telefoon",
  email: "E-mail",
  persoonlijk: "Persoonlijk",
  teams: "Teams",
  anders: "Anders",
};

export async function ConversationLogsSection({ prospectId }: { prospectId: string }) {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("conversation_logs")
    .select("id, log_date, contact_type, summary, content")
    .eq("prospect_id", prospectId)
    .order("log_date", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AddConversationLogForm prospectId={prospectId} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {(logs ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen gespreksverslagen.</p>
        ) : (
          (logs ?? []).map((log) => (
            <div key={log.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {CONTACT_TYPE_LABELS[log.contact_type] ?? log.contact_type} · {formatDateTime(log.log_date)}
                  </p>
                  <p className="mt-1 text-sm">{log.summary}</p>
                  {log.content ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{log.content}</p>
                  ) : null}
                </div>
                <DeleteLogButton prospectId={prospectId} logId={log.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
