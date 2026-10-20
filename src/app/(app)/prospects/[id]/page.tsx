import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArchetypeMethodologyPanel } from "@/components/shared/archetype-methodology-panel";
import { ArchetypePersonaCard } from "@/components/shared/archetype-persona-card";
import { ConversationLogsSection } from "@/components/shared/conversation-logs-section";
import { ConvertToSponsorshipDialog } from "@/components/shared/convert-to-sponsorship-dialog";
import { DeleteProspectButton } from "@/components/shared/delete-prospect-button";
import { ProspectForm } from "@/components/shared/prospect-form";
import { ProspectTasksSection } from "@/components/shared/prospect-tasks-section";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { archetypeById } from "@/lib/archetypes";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: prospect },
    { data: contacts },
    { data: phoneNumbers },
    { data: stages },
    { data: owners },
    { data: events },
    { data: packages },
    { data: archetypeAssessments },
  ] = await Promise.all([
    supabase.from("prospects").select("*").eq("id", id).single(),
    supabase.from("prospect_contacts").select("*").eq("prospect_id", id),
    supabase.from("prospect_phone_numbers").select("*").eq("prospect_id", id),
    supabase.from("pipeline_stages").select("*").order("sort_order"),
    supabase.from("owners").select("*").order("name"),
    supabase.from("events").select("*").order("name"),
    supabase.from("event_packages").select("*").order("sort_order"),
    supabase
      .from("archetype_assessments")
      .select("id, matches, explanation, created_at")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!prospect) {
    notFound();
  }

  const archetype = archetypeById(prospect.archetype_id as ArchetypeId | null);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/acquisitie" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Terug naar acquisitie
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-semibold">{prospect.company}</h1>
        <div className="flex items-center gap-2">
          <ConvertToSponsorshipDialog
            prospectId={prospect.id}
            estValue={prospect.est_value}
            events={events ?? []}
            packages={packages ?? []}
          />
          <DeleteProspectButton prospectId={prospect.id} />
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="profiel" orientation="vertical" className="flex-row gap-4">
            <TabsList className="h-fit w-44 shrink-0 flex-col items-stretch justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="profiel" className="flex-none justify-start data-[state=active]:bg-accent">
                Profiel
              </TabsTrigger>
              <TabsTrigger value="gesprekken" className="flex-none justify-start data-[state=active]:bg-accent">
                Gespreksverslagen
              </TabsTrigger>
              <TabsTrigger value="taken" className="flex-none justify-start data-[state=active]:bg-accent">
                Taken
              </TabsTrigger>
              {archetype ? (
                <TabsTrigger
                  value="verkoopmethodiek"
                  className="flex-none justify-start data-[state=active]:bg-accent"
                >
                  Verkoopmethodiek
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="profiel" className="flex min-w-0 flex-col gap-4">
              {archetype ? (
                <ArchetypePersonaCard
                  archetype={archetype}
                  prospectId={prospect.id}
                  assessments={archetypeAssessments ?? []}
                />
              ) : (
                <Card>
                  <CardContent className="text-sm text-muted-foreground">
                    Nog geen archetype toegekend. Kies er één hieronder om de bijbehorende verkoopmethodiek
                    te zien.
                  </CardContent>
                </Card>
              )}
              <ProspectForm
                prospect={prospect}
                contacts={contacts ?? []}
                phoneNumbers={phoneNumbers ?? []}
                stages={stages ?? []}
                owners={owners ?? []}
              />
            </TabsContent>

            <TabsContent value="gesprekken" className="min-w-0">
              <ConversationLogsSection prospectId={prospect.id} />
            </TabsContent>

            <TabsContent value="taken" className="min-w-0">
              <ProspectTasksSection prospectId={prospect.id} />
            </TabsContent>

            {archetype ? (
              <TabsContent value="verkoopmethodiek" className="min-w-0">
                <ArchetypeMethodologyPanel archetype={archetype} />
              </TabsContent>
            ) : null}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
