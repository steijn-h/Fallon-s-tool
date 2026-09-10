import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfilesFilterForm } from "@/components/shared/profiles-filter-form";
import { requireSession } from "@/lib/auth/session";
import { PROFILE_STATUS_LABELS } from "@/lib/format";
import { getPackageFeatures } from "@/lib/packages/features";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/lib/supabase/database.types";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    leadSource?: string;
    archetype?: string;
    archived?: string;
  }>;
}) {
  const session = await requireSession();
  const features = getPackageFeatures(session.packageType);
  const params = await searchParams;
  const supabase = await createClient();

  const archivedFilter = params.archived ?? "hide";

  let query = supabase
    .from("profiles")
    .select(
      "id, organization_name, contact_name, city, email, status, archetype_id, archived_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status as ProfileStatus);
  }
  if (archivedFilter === "hide") {
    query = query.is("archived_at", null);
  } else if (archivedFilter === "only") {
    query = query.not("archived_at", "is", null);
  }
  if (params.archetype && features.showArchetype) {
    query = query.eq("archetype_id", params.archetype);
  }

  const [{ data: profiles }, { data: leadSources }, { data: leadSourceLinks }, { data: archetypes }] =
    await Promise.all([
      query,
      supabase.from("lead_sources").select("id, name").order("name"),
      supabase.from("profile_lead_source").select("profile_id, lead_source_id"),
      features.showArchetype
        ? supabase.from("archetypes").select("id, name").order("name")
        : Promise.resolve({ data: null }),
    ]);

  const leadSourceNameById = new Map((leadSources ?? []).map((s) => [s.id, s.name]));
  const leadSourceIdByProfile = new Map(
    (leadSourceLinks ?? []).map((l) => [l.profile_id, l.lead_source_id]),
  );
  const archetypeNameById = new Map((archetypes ?? []).map((a) => [a.id, a.name]));

  let rows = profiles ?? [];
  if (params.leadSource) {
    rows = rows.filter((p) => leadSourceIdByProfile.get(p.id) === params.leadSource);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profielen</h1>
        <Button asChild>
          <Link href="/profiles/new">Nieuw profiel</Link>
        </Button>
      </div>

      <ProfilesFilterForm
        leadSources={leadSources ?? []}
        archetypes={features.showArchetype ? (archetypes ?? []) : null}
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Contactpersoon</TableHead>
                <TableHead>Plaats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leadafkomst</TableHead>
                {features.showArchetype ? <TableHead>Archetype</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={features.showArchetype ? 6 : 5}
                    className="text-center text-muted-foreground"
                  >
                    Geen profielen gevonden.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Link
                        href={`/profiles/${profile.id}`}
                        className="font-medium hover:underline"
                      >
                        {profile.organization_name}
                      </Link>
                      {profile.archived_at ? (
                        <Badge variant="outline" className="ml-2">
                          Gearchiveerd
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>{profile.contact_name ?? "-"}</TableCell>
                    <TableCell>{profile.city ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {PROFILE_STATUS_LABELS[profile.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {leadSourceNameById.get(
                        leadSourceIdByProfile.get(profile.id) ?? "",
                      ) ?? "-"}
                    </TableCell>
                    {features.showArchetype ? (
                      <TableCell>
                        {archetypeNameById.get(profile.archetype_id ?? "") ?? "-"}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
