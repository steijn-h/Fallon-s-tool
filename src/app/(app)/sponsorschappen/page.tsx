import Link from "next/link";

import { EventsBulkView } from "@/components/shared/events-bulk-view";
import { NewSponsorshipDialog } from "@/components/shared/new-sponsorship-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SponsorshipsTable } from "@/components/shared/sponsorships-table";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { SponsorshipStatus } from "@/lib/types";

export default async function SponsorshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; packageId?: string; view?: string }>;
}) {
  const { status, packageId, view } = await searchParams;
  const isEventsView = view === "events";
  const supabase = await createClient();

  const [{ data: sponsorships }, { data: owners }, { data: events }, { data: packages }, { data: performances }] =
    await Promise.all([
      supabase
        .from("sponsorships")
        .select("id, company, industry, logo_color, event_package_id, status, value, start_date, end_date, owner_id")
        .order("created_at", { ascending: false }),
      supabase.from("owners").select("*").order("name"),
      supabase.from("events").select("*").order("name"),
      supabase.from("event_packages").select("*").order("sort_order"),
      supabase.from("reciprocal_performances").select("*").order("sort_order"),
    ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sponsorschappen"
        subtitle="Alle actieve en afgeronde sponsorrelaties."
        actions={
          <NewSponsorshipDialog owners={owners ?? []} events={events ?? []} packages={packages ?? []} />
        }
      />

      <div className="flex w-fit rounded-md border border-border bg-secondary p-0.5 text-sm">
        <Link
          href="/sponsorschappen"
          className={cn(
            "rounded-sm px-3 py-1.5 font-medium transition-colors",
            !isEventsView ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Organisaties
        </Link>
        <Link
          href="/sponsorschappen?view=events"
          className={cn(
            "rounded-sm px-3 py-1.5 font-medium transition-colors",
            isEventsView ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Events
        </Link>
      </div>

      {isEventsView ? (
        <EventsBulkView
          events={events ?? []}
          packages={packages ?? []}
          sponsorships={sponsorships ?? []}
          performances={performances ?? []}
        />
      ) : (
        <SponsorshipsTable
          sponsorships={sponsorships ?? []}
          owners={owners ?? []}
          events={events ?? []}
          packages={packages ?? []}
          initialStatus={status as SponsorshipStatus | undefined}
          initialPackageId={packageId}
        />
      )}
    </div>
  );
}
