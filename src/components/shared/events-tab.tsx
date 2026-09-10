import { LinkEventForm } from "@/components/shared/link-event-form";
import { UnlinkEventButton } from "@/components/shared/unlink-event-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, PROFILE_EVENT_ROLE_LABELS } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function EventsTab({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const [{ data: links }, { data: events }] = await Promise.all([
    supabase
      .from("profile_event_links")
      .select("id, event_id, role, created_at")
      .eq("profile_id", profileId),
    supabase.from("events").select("id, name, start_date, end_date, location").order("start_date"),
  ]);

  const eventById = new Map((events ?? []).map((e) => [e.id, e]));
  const linkedEventIds = new Set((links ?? []).map((l) => l.event_id));
  const availableEvents = (events ?? []).filter((e) => !linkedEventIds.has(e.id));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <LinkEventForm profileId={profileId} events={availableEvents} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {(links ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Dit profiel is nog niet gekoppeld aan een evenement.
          </p>
        ) : (
          (links ?? []).map((link) => {
            const event = eventById.get(link.event_id);
            return (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium">{event?.name ?? "Onbekend evenement"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event?.start_date)}
                    {event?.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{PROFILE_EVENT_ROLE_LABELS[link.role]}</Badge>
                  <UnlinkEventButton profileId={profileId} linkId={link.id} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
