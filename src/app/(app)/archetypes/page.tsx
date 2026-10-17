import { ArchetypeMethodologyPanel } from "@/components/shared/archetype-methodology-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ARCHETYPES } from "@/lib/archetypes";
import { RETURN_LABELS } from "@/lib/types";

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

export default function ArchetypesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Archetypen"
        subtitle="Zes persona's die bepalen hoe een prospect of sponsor het beste benaderd wordt."
      />

      <div className="flex flex-col gap-6">
        {ARCHETYPES.map((archetype) => (
          <div key={archetype.id} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardContent className="flex flex-col gap-4">
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
              </CardContent>
            </Card>

            <ArchetypeMethodologyPanel archetype={archetype} />
          </div>
        ))}
      </div>
    </div>
  );
}
