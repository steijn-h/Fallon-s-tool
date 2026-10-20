import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AssessmentSection } from "@/components/shared/assessment-section";
import { CompanyMark } from "@/components/shared/company-mark";
import { EventPackageBadge } from "@/components/shared/status-badges";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

export default async function BeoordelingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sponsorship } = await supabase
    .from("sponsorships")
    .select("id, company, logo_color, event_package_id, archetype_id")
    .eq("id", id)
    .single();

  if (!sponsorship) {
    notFound();
  }

  const { data: eventPackage } = await supabase
    .from("event_packages")
    .select("name, color")
    .eq("id", sponsorship.event_package_id)
    .single();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/beoordeling"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Terug naar beoordeling
      </Link>

      <div className="flex items-center gap-3">
        <CompanyMark name={sponsorship.company} color={sponsorship.logo_color} className="size-11" />
        <div>
          <h1 className="font-display text-xl font-semibold">{sponsorship.company}</h1>
          {eventPackage ? <EventPackageBadge name={eventPackage.name} color={eventPackage.color} /> : null}
        </div>
      </div>

      <Card>
        <CardContent>
          <AssessmentSection
            sponsorshipId={sponsorship.id}
            archetypeId={sponsorship.archetype_id as ArchetypeId | null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
