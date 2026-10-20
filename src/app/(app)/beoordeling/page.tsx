import { BeoordelingList } from "@/components/shared/beoordeling-list";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function BeoordelingPage() {
  const supabase = await createClient();

  const [{ data: sponsorships }, { data: prospects }, { data: packages }] = await Promise.all([
    supabase
      .from("sponsorships")
      .select("id, company, logo_color, event_package_id, status, archetype_id, prospect_id")
      .order("company"),
    supabase.from("prospects").select("id, company, company_type, organization_size"),
    supabase.from("event_packages").select("id, name, color"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Beoordeling" subtitle="Beoordeel sponsorschappen op de gedefinieerde handvatten." />
      <BeoordelingList sponsorships={sponsorships ?? []} prospects={prospects ?? []} packages={packages ?? []} />
    </div>
  );
}
