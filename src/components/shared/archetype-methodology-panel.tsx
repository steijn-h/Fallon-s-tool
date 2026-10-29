import { Card, CardContent } from "@/components/ui/card";
import { RETURN_LABELS } from "@/lib/types";
import type { Archetype } from "@/lib/archetypes";

export function ArchetypeMethodologyPanel({ archetype }: { archetype: Archetype }) {
  const { methodology } = archetype;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Methodiek voor dit archetype</p>
          <p className="font-display text-base font-semibold">{archetype.name}</p>
          <p className="mt-1 text-sm text-muted-foreground italic">&ldquo;{archetype.quote}&rdquo;</p>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Aanpak</p>
          <p className="mt-1 text-sm text-muted-foreground">{methodology.approach}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Openingsstrategie</p>
          <p className="mt-1 text-sm text-muted-foreground">{methodology.openingStrategy}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Kwalificatiecriteria</p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {methodology.qualificationCriteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Bezwaren &amp; weerleggingen</p>
          <div className="mt-1 flex flex-col gap-2">
            {methodology.objections.map((objection, index) => (
              <div key={index} className="rounded-md bg-secondary p-2.5 text-sm">
                <p className="font-medium text-foreground">&ldquo;{objection.objection}&rdquo;</p>
                <p className="mt-1 text-muted-foreground">{objection.rebuttal}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Value pitch</p>
          <p className="mt-1 text-sm text-muted-foreground">{methodology.valuePitch}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Focus op: {methodology.pitchReturnTypes.map((t) => RETURN_LABELS[t]).join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
