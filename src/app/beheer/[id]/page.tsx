import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AddOrganizationMemberForm } from "@/components/shared/add-organization-member-form";
import { OrganizationMemberRow } from "@/components/shared/organization-member-row";
import { OrganizationSettingsForm } from "@/components/shared/organization-settings-form";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: organization }, { data: members }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).single(),
    supabase.from("organization_members").select("id, user_id, role").eq("organization_id", id),
  ]);

  if (!organization) {
    notFound();
  }

  const memberEmails = await Promise.all(
    (members ?? []).map(async (m) => {
      const { data: email } = await supabase.rpc("lookup_user_email", { lookup_user_id: m.user_id });
      return { ...m, email };
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/beheer"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Terug naar organisaties
      </Link>

      <PageHeader title={organization.name} subtitle={`Pakket ${organization.package_type}`} />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Instellingen</SectionTitle>
          <OrganizationSettingsForm
            organizationId={organization.id}
            name={organization.name}
            packageType={organization.package_type}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Medewerker toevoegen</SectionTitle>
          <AddOrganizationMemberForm organizationId={organization.id} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <SectionTitle>Medewerkers ({memberEmails.length})</SectionTitle>
          {memberEmails.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen medewerkers gekoppeld.</p>
          ) : (
            memberEmails.map((m) => (
              <OrganizationMemberRow
                key={m.id}
                organizationId={organization.id}
                memberId={m.id}
                email={m.email}
                role={m.role}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
