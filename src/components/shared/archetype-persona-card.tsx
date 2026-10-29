import Image from "next/image";
import type { CSSProperties } from "react";

import { ArchetypeAssessmentSection, type ArchetypeAssessmentRow } from "@/components/shared/archetype-assessment-section";
import { SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Archetype, Motivation } from "@/lib/archetypes";

// Decoratieve identiteitskleur per archetype — zelfde hsl(var(--x))-patroon
// als CompanyMark/OwnerAvatar, niet een data-vizpalet (dit is geen chart).
const ARCHETYPE_COLORS: Record<string, string> = {
  "calculerende-rationalist": "217 91% 55%",
  "lokale-held": "25 95% 53%",
  "netwerker-relatiebeheerder": "142 71% 45%",
  "stadstrots-aanjager": "262 83% 58%",
  talentenjager: "199 89% 48%",
  "vinkjes-zetter": "220 9% 46%",
};

const MOTIVATION_LABELS: Record<keyof Motivation, string> = {
  verbinding: "Verbinding",
  autonomie: "Autonomie",
  competentie: "Competentie",
};

export function ArchetypePersonaCard({
  archetype,
  prospectId,
  sponsorshipId,
  assessments,
  imageUrl,
}: {
  archetype: Archetype;
  prospectId?: string;
  sponsorshipId?: string;
  assessments: ArchetypeAssessmentRow[];
  imageUrl?: string | null;
}) {
  const color = ARCHETYPE_COLORS[archetype.id] ?? "220 9% 46%";
  const style = { "--persona-color": color } as CSSProperties;
  const personaImage = imageUrl;

  return (
    <Card className="overflow-hidden p-0">
      {personaImage ? (
        <Image
          src={personaImage}
          alt={`Persona: ${archetype.name}`}
          width={2000}
          height={900}
          unoptimized
          className="w-full"
        />
      ) : (
        <div style={style} className="bg-[hsl(var(--persona-color)/0.12)] p-5">
          <p className="text-xs font-medium tracking-wide text-[hsl(var(--persona-color))] uppercase">
            {archetype.companyType}
          </p>
          <h3 className="font-display text-xl font-semibold text-foreground">{archetype.name}</h3>
          <p className="mt-1.5 text-sm italic text-muted-foreground">&ldquo;{archetype.quote}&rdquo;</p>
        </div>
      )}

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{archetype.description}</p>

        {!personaImage ? (
          <div className="flex flex-col gap-2.5">
            {(Object.keys(archetype.motivation) as (keyof Motivation)[]).map((dimension) => (
              <div key={dimension} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-foreground">{MOTIVATION_LABELS[dimension]}</span>
                  <span className="text-muted-foreground">{archetype.motivation[dimension]}</span>
                </div>
                <Progress
                  value={archetype.motivation[dimension]}
                  className="h-1.5"
                  style={style}
                  indicatorClassName="bg-[hsl(var(--persona-color))]"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="border-t border-border pt-3">
          <SectionTitle>Klopt dit archetype?</SectionTitle>
          <ArchetypeAssessmentSection
            prospectId={prospectId}
            sponsorshipId={sponsorshipId}
            archetypeId={archetype.id}
            assessments={assessments}
          />
        </div>
      </CardContent>
    </Card>
  );
}
