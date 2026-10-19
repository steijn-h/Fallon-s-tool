import { NewSponsorshipDialog } from "@/components/shared/new-sponsorship-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SponsorshipsTable } from "@/components/shared/sponsorships-table";
import { createClient } from "@/lib/supabase/server";

export default async function SponsorshipsPage() {
  const supabase = await createClient();

  const [{ data: sponsorships }, { data: owners }, { data: events }, { data: packages }] = await Promise.all([
    supabase
      .from("sponsorships")
      .select("id, company, industry, logo_color, event_package_id, status, value, start_date, end_date, owner_id")
      .order("created_at", { ascending: false }),
    supabase.from("owners").select("*").order("name"),
    supabase.from("events").select("*").order("name"),
    supabase.from("event_packages").select("*").order("sort_order"),
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
      <SponsorshipsTable
        sponsorships={sponsorships ?? []}
        owners={owners ?? []}
        events={events ?? []}
        packages={packages ?? []}
      />
    </div>
  );
}
