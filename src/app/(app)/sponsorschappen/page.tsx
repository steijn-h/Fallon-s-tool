import { NewSponsorshipDialog } from "@/components/shared/new-sponsorship-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SponsorshipsTable } from "@/components/shared/sponsorships-table";
import { createClient } from "@/lib/supabase/server";

export default async function SponsorshipsPage() {
  const supabase = await createClient();

  const [{ data: sponsorships }, { data: owners }] = await Promise.all([
    supabase
      .from("sponsorships")
      .select("id, company, industry, logo_color, tier, status, value, start_date, end_date, owner_id")
      .order("created_at", { ascending: false }),
    supabase.from("owners").select("*").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sponsorschappen"
        subtitle="Alle actieve en afgeronde sponsorrelaties."
        actions={<NewSponsorshipDialog owners={owners ?? []} />}
      />
      <SponsorshipsTable sponsorships={sponsorships ?? []} owners={owners ?? []} />
    </div>
  );
}
