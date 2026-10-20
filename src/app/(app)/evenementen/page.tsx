import Link from "next/link";

import { EventsManager } from "@/components/shared/events-manager";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { compactCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function EvenementenPage() {
  const supabase = await createClient();

  const [
    { data: events },
    { data: packages },
    { data: prices },
    { data: performances },
    { data: actions },
    { data: entries },
    { data: sponsorships },
    { data: eventPackages },
  ] = await Promise.all([
    supabase.from("events").select("*").order("name"),
    supabase.from("event_packages").select("*").order("sort_order"),
    supabase.from("event_package_prices").select("*"),
    supabase.from("reciprocal_performances").select("*").order("sort_order"),
    supabase.from("reciprocal_performance_actions").select("*").order("sort_order"),
    supabase.from("financial_entries").select("event_id, type, amount"),
    supabase.from("sponsorships").select("id, value, event_package_id"),
    supabase.from("event_packages").select("id, event_id"),
  ]);

  const packageToEventId = new Map((eventPackages ?? []).map((p) => [p.id, p.event_id]));
  const eventIdBySponsorshipId = new Map(
    (sponsorships ?? []).map((s) => [s.id, packageToEventId.get(s.event_package_id) ?? null]),
  );

  const netResultByEventId = new Map<string, number>();
  for (const event of events ?? []) {
    const sponsorRevenue = (sponsorships ?? [])
      .filter((s) => eventIdBySponsorshipId.get(s.id) === event.id)
      .reduce((sum, s) => sum + s.value, 0);
    const otherIncome = (entries ?? [])
      .filter((e) => e.event_id === event.id && e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);
    const expense = (entries ?? [])
      .filter((e) => e.event_id === event.id && e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);
    netResultByEventId.set(event.id, sponsorRevenue + otherIncome - expense);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Evenementen"
        subtitle="Evenementen, pakketprijzen per jaar, kostprijs, en wederkerige prestaties — alles op één plek."
      />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Financieel resultaat per evenement</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(events ?? []).map((event) => {
              const net = netResultByEventId.get(event.id) ?? 0;
              return (
                <Link
                  key={event.id}
                  href={`/financieel?eventId=${event.id}`}
                  className="rounded-md border border-border p-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <p className="font-medium">{event.name}</p>
                  <p className={net >= 0 ? "text-success" : "text-destructive"}>
                    Netto {compactCurrency(net)}
                  </p>
                </Link>
              );
            })}
            {(events ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen evenementen.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <EventsManager
        events={events ?? []}
        packages={packages ?? []}
        prices={prices ?? []}
        performances={performances ?? []}
        actions={actions ?? []}
      />
    </div>
  );
}
