import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActivitiesTimeline } from "@/components/shared/activities-timeline";
import { ArchetypePersonaCard } from "@/components/shared/archetype-persona-card";
import { AssessmentSection } from "@/components/shared/assessment-section";
import { DeleteSponsorshipButton } from "@/components/shared/delete-sponsorship-button";
import { DeliverablesSection } from "@/components/shared/deliverables-section";
import { PaymentsSection } from "@/components/shared/payments-section";
import { RenewSponsorshipDialog } from "@/components/shared/renew-sponsorship-dialog";
import { SponsorshipForm } from "@/components/shared/sponsorship-form";
import { SponsorshipStatusSelect } from "@/components/shared/sponsorship-status-select";
import { SponsorshipTasksSection } from "@/components/shared/sponsorship-tasks-section";
import { StatusPipeline } from "@/components/shared/status-pipeline";
import { CompanyMark } from "@/components/shared/company-mark";
import { EventPackageBadge } from "@/components/shared/status-badges";
import { findOwner, OwnerAvatar } from "@/components/shared/owner-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { archetypeById } from "@/lib/archetypes";
import { currency, durationYears } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

export default async function SponsorshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: sponsorship },
    { data: owners },
    { data: events },
    { data: packages },
    { data: archetypeAssessments },
    { data: archetypeSettings },
  ] = await Promise.all([
    supabase.from("sponsorships").select("*").eq("id", id).single(),
    supabase.from("owners").select("*").order("name"),
    supabase.from("events").select("*").order("name"),
    supabase.from("event_packages").select("*").order("sort_order"),
    supabase
      .from("archetype_assessments")
      .select("id, matches, explanation, created_at")
      .eq("sponsorship_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("archetype_settings").select("archetype_id, image_url"),
  ]);

  if (!sponsorship) {
    notFound();
  }
  const owner = findOwner(owners ?? [], sponsorship.owner_id);
  const years = durationYears(sponsorship.start_date, sponsorship.end_date);
  const currentPackage = (packages ?? []).find((p) => p.id === sponsorship.event_package_id);
  const currentEvent = (events ?? []).find((e) => e.id === currentPackage?.event_id);
  const archetype = archetypeById(sponsorship.archetype_id as ArchetypeId | null);
  const archetypeImageUrl =
    (archetypeSettings ?? []).find((s) => s.archetype_id === sponsorship.archetype_id)?.image_url ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/sponsorschappen"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Terug naar sponsorschappen
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CompanyMark name={sponsorship.company} color={sponsorship.logo_color} className="size-11" />
          <div>
            <h1 className="font-display text-xl font-semibold">{sponsorship.company}</h1>
            <div className="mt-1 flex items-center gap-2">
              {currentPackage ? (
                <EventPackageBadge name={currentPackage.name} color={currentPackage.color} />
              ) : null}
              <span className="text-sm text-muted-foreground">
                {currentEvent?.name} · {currency(sponsorship.value)} · {years.toFixed(1)} jaar looptijd
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OwnerAvatar owner={owner} showName />
          <SponsorshipStatusSelect sponsorshipId={sponsorship.id} status={sponsorship.status} />
          <RenewSponsorshipDialog
            sponsorshipId={sponsorship.id}
            currentEndDate={sponsorship.end_date}
            currentValue={sponsorship.value}
          />
          <DeleteSponsorshipButton sponsorshipId={sponsorship.id} />
        </div>
      </div>

      <Card>
        <CardContent>
          <StatusPipeline status={sponsorship.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs defaultValue="overzicht" orientation="vertical" className="flex-row gap-4">
            <TabsList className="h-fit w-44 shrink-0 flex-col items-stretch justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="overzicht" className="flex-none justify-start data-[state=active]:bg-accent">
                Profiel
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="flex-none justify-start data-[state=active]:bg-accent">
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="betalingen" className="flex-none justify-start data-[state=active]:bg-accent">
                Betalingen
              </TabsTrigger>
              <TabsTrigger value="activiteiten" className="flex-none justify-start data-[state=active]:bg-accent">
                Activiteiten
              </TabsTrigger>
              <TabsTrigger value="taken" className="flex-none justify-start data-[state=active]:bg-accent">
                Taken
              </TabsTrigger>
              <TabsTrigger value="beoordeling" className="flex-none justify-start data-[state=active]:bg-accent">
                Beoordeling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overzicht" className="flex min-w-0 flex-col gap-4">
              {archetype ? (
                <ArchetypePersonaCard
                  archetype={archetype}
                  sponsorshipId={sponsorship.id}
                  assessments={archetypeAssessments ?? []}
                  imageUrl={archetypeImageUrl}
                />
              ) : null}
              <SponsorshipForm
                sponsorship={sponsorship}
                owners={owners ?? []}
                events={events ?? []}
                packages={packages ?? []}
              />
            </TabsContent>
            <TabsContent value="deliverables" className="min-w-0">
              <DeliverablesSection sponsorshipId={sponsorship.id} />
            </TabsContent>
            <TabsContent value="betalingen" className="min-w-0">
              <PaymentsSection sponsorshipId={sponsorship.id} />
            </TabsContent>
            <TabsContent value="activiteiten" className="min-w-0">
              <ActivitiesTimeline sponsorshipId={sponsorship.id} />
            </TabsContent>
            <TabsContent value="taken" className="min-w-0">
              <SponsorshipTasksSection sponsorshipId={sponsorship.id} />
            </TabsContent>
            <TabsContent value="beoordeling" className="min-w-0">
              <AssessmentSection
                sponsorshipId={sponsorship.id}
                archetypeId={sponsorship.archetype_id as ArchetypeId | null}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
