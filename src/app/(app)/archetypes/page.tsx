import Image from "next/image";

import { ArchetypeMethodologyPanel } from "@/components/shared/archetype-methodology-panel";
import { ArchetypeSettingsForm } from "@/components/shared/archetype-settings-form";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ARCHETYPES, archetypeById, weightedTotalForArchetype } from "@/lib/archetypes";
import { createClient } from "@/lib/supabase/server";
import { RETURN_LABELS, type ArchetypeId } from "@/lib/types";

const MOTIVATION_LABELS = {
  verbinding: "Verbinding",
  autonomie: "Autonomie",
  competentie: "Competentie",
} as const;

const DMU_LABELS = {
  beslisser: "Beslisser",
  beinvloeder: "Beïnvloeder",
  gebruiker: "Gebruiker",
} as const;

export default async function ArchetypesPage() {
  const supabase = await createClient();

  const [
    { data: events },
    { data: sponsorships },
    { data: eventPackages },
    { data: handles },
    { data: scores },
    { data: settings },
  ] = await Promise.all([
    supabase.from("events").select("id, name").order("name"),
    supabase.from("sponsorships").select("id, archetype_id, event_package_id"),
    supabase.from("event_packages").select("id, event_id"),
    supabase.from("handles").select("id, weight"),
    supabase.from("assessment_scores").select("sponsorship_id, handle_id, score"),
    supabase.from("archetype_settings").select("*"),
  ]);

  const eventIdByPackageId = new Map((eventPackages ?? []).map((p) => [p.id, p.event_id]));
  const settingsByArchetype = new Map((settings ?? []).map((s) => [s.archetype_id, s]));

  const scoresBySponsorship = new Map<string, Map<string, number>>();
  for (const s of scores ?? []) {
    if (!scoresBySponsorship.has(s.sponsorship_id)) scoresBySponsorship.set(s.sponsorship_id, new Map());
    scoresBySponsorship.get(s.sponsorship_id)!.set(s.handle_id, s.score);
  }

  // Per event, per archetype: how many sponsorships, and how well they
  // actually score against that archetype's own motivational profile —
  // "waar verbeter-/optimalisatieslagen nodig zijn" at a glance.
  const fitRows: { eventName: string; archetypeName: string; count: number; avgScore: number | null }[] = [];
  for (const event of events ?? []) {
    const eventSponsorships = (sponsorships ?? []).filter(
      (s) => s.archetype_id && eventIdByPackageId.get(s.event_package_id) === event.id,
    );
    const byArchetype = new Map<string, typeof eventSponsorships>();
    for (const s of eventSponsorships) {
      const list = byArchetype.get(s.archetype_id!) ?? [];
      list.push(s);
      byArchetype.set(s.archetype_id!, list);
    }
    for (const [archetypeId, list] of byArchetype) {
      const archetype = archetypeById(archetypeId as ArchetypeId);
      const scoredTotals = list
        .map((s) => weightedTotalForArchetype(archetype, handles ?? [], scoresBySponsorship.get(s.id) ?? new Map()))
        .filter((t): t is number => t !== null);
      fitRows.push({
        eventName: event.name,
        archetypeName: archetype?.name ?? archetypeId,
        count: list.length,
        avgScore:
          scoredTotals.length > 0
            ? Math.round((scoredTotals.reduce((a, b) => a + b, 0) / scoredTotals.length) * 10) / 10
            : null,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Archetypen"
        subtitle="Zes persona's die bepalen hoe een prospect of sponsor het beste benaderd wordt."
      />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Archetypen per evenement</SectionTitle>
          <p className="text-sm text-muted-foreground">
            Welke archetypes zijn vertegenwoordigd per evenement, en hoe goed scoren ze (gewogen op de
            beoordeling van dat archetype)? Een laag gemiddelde betekent dat er verbeter- of
            optimalisatieslagen nodig zijn bij die groep sponsors.
          </p>
          {fitRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nog geen sponsorschappen met een gekoppeld archetype en beoordeling.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fitRows.map((row, i) => (
                <div key={i} className="rounded-md border border-border p-2.5">
                  <p className="text-xs text-muted-foreground">{row.eventName}</p>
                  <p className="text-sm font-medium">{row.archetypeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.count} sponsor(s) ·{" "}
                    {row.avgScore !== null ? (
                      <span
                        className={row.avgScore < 60 ? "font-medium text-destructive" : "font-medium text-success"}
                      >
                        gem. {row.avgScore}/100
                      </span>
                    ) : (
                      "nog niet beoordeeld"
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SectionTitle>Naslagwerk per archetype</SectionTitle>
      <div className="flex flex-col gap-6">
        {ARCHETYPES.map((archetype) => {
          const setting = settingsByArchetype.get(archetype.id);
          return (
            <div key={archetype.id} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Card>
                <CardContent className="flex flex-col gap-4">
                  {setting?.image_url ? (
                    <Image
                      src={setting.image_url}
                      alt={archetype.name}
                      width={400}
                      height={200}
                      unoptimized
                      className="h-40 w-full rounded-md object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-display text-lg font-semibold">{archetype.name}</p>
                    <p className="text-sm text-muted-foreground">{archetype.companyType}</p>
                    <p className="mt-2 text-sm">{archetype.description}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {(Object.keys(MOTIVATION_LABELS) as (keyof typeof MOTIVATION_LABELS)[]).map((key) => (
                      <div key={key} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{MOTIVATION_LABELS[key]}</span>
                          <span className="font-medium">{archetype.motivation[key]}</span>
                        </div>
                        <Progress value={archetype.motivation[key]} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{RETURN_LABELS[archetype.returnSpectrum.primary]}</Badge>
                    <Badge variant="outline">{RETURN_LABELS[archetype.returnSpectrum.secondary]}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{archetype.decisionStyle.initiative}</span>
                    <span>·</span>
                    <span>{archetype.decisionStyle.orientation}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(DMU_LABELS) as (keyof typeof DMU_LABELS)[])
                      .filter((key) => archetype.dmu[key])
                      .map((key) => (
                        <Badge key={key} variant="outline">
                          {DMU_LABELS[key]}
                        </Badge>
                      ))}
                  </div>

                  {setting?.notes ? (
                    <p className="rounded-md bg-secondary p-2 text-xs text-secondary-foreground">
                      {setting.notes}
                    </p>
                  ) : null}

                  <ArchetypeSettingsForm
                    archetypeId={archetype.id}
                    imageUrl={setting?.image_url ?? null}
                    notes={setting?.notes ?? null}
                  />
                </CardContent>
              </Card>

              <ArchetypeMethodologyPanel archetype={archetype} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
