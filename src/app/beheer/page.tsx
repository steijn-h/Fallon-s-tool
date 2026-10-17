import Link from "next/link";

import { CreateOrganizationForm } from "@/components/shared/create-organization-form";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const PACKAGE_LABELS: Record<string, string> = {
  a: "a — Evenementen",
  b: "b — Standaard",
  c: "c — Citymarketing",
};

export default async function BeheerPage() {
  const supabase = await createClient();

  const [{ data: organizations }, { data: members }] = await Promise.all([
    supabase.from("organizations").select("id, name, package_type, created_at").order("created_at"),
    supabase.from("organization_members").select("organization_id"),
  ]);

  const memberCountByOrg = new Map<string, number>();
  for (const m of members ?? []) {
    memberCountByOrg.set(m.organization_id, (memberCountByOrg.get(m.organization_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organisaties"
        subtitle="Elke organisatie krijgt haar eigen Stracq-portaal, met functiediepte op basis van het toegekende pakket."
      />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Nieuwe organisatie</SectionTitle>
          <CreateOrganizationForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <SectionTitle>Alle organisaties ({(organizations ?? []).length})</SectionTitle>
          {(organizations ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen organisaties aangemaakt.</p>
          ) : (
            (organizations ?? []).map((org) => (
              <Link
                key={org.id}
                href={`/beheer/${org.id}`}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-sm hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PACKAGE_LABELS[org.package_type] ?? org.package_type} ·{" "}
                    {memberCountByOrg.get(org.id) ?? 0} medewerker(s)
                  </p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
