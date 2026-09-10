import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateEventForm } from "@/components/shared/create-event-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getPackageFeatures } from "@/lib/packages/features";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
  const session = await requireSession();
  const features = getPackageFeatures(session.packageType);

  if (!features.tabs.includes("events")) {
    notFound();
  }

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, name, location, start_date, end_date")
    .order("start_date", { ascending: false });

  const { data: links } = await supabase.from("profile_event_links").select("event_id");
  const linkCountByEvent = new Map<string, number>();
  for (const link of links ?? []) {
    linkCountByEvent.set(link.event_id, (linkCountByEvent.get(link.event_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Evenementen</h1>

      <Card>
        <CardContent>
          <CreateEventForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Gekoppelde profielen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(events ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nog geen evenementen.
                  </TableCell>
                </TableRow>
              ) : (
                (events ?? []).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.location ?? "-"}</TableCell>
                    <TableCell>
                      {formatDate(event.start_date)}
                      {event.end_date ? ` – ${formatDate(event.end_date)}` : ""}
                    </TableCell>
                    <TableCell>{linkCountByEvent.get(event.id) ?? 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Koppel een profiel aan een evenement via het tabblad &ldquo;Evenementen&rdquo; op een{" "}
        <Link href="/profiles" className="underline">
          profiel
        </Link>
        .
      </p>
    </div>
  );
}
