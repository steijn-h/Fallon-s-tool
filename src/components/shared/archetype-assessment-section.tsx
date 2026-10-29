"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addArchetypeAssessment } from "@/lib/actions/archetype-assessments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import type { ArchetypeId } from "@/lib/types";

export interface ArchetypeAssessmentRow {
  id: string;
  matches: boolean;
  explanation: string | null;
  created_at: string;
}

export function ArchetypeAssessmentSection({
  prospectId,
  sponsorshipId,
  archetypeId,
  assessments,
}: {
  prospectId?: string;
  sponsorshipId?: string;
  archetypeId: ArchetypeId | null;
  assessments: ArchetypeAssessmentRow[];
}) {
  const [explanation, setExplanation] = useState("");
  const [pending, startTransition] = useTransition();

  if (!archetypeId) {
    return (
      <p className="text-sm text-muted-foreground">
        Nog geen archetype gekoppeld — er is dus ook nog niets te beoordelen.
      </p>
    );
  }

  function handleLog(matches: boolean) {
    startTransition(async () => {
      try {
        await addArchetypeAssessment({ prospectId, sponsorshipId, archetypeId: archetypeId!, matches, explanation });
        setExplanation("");
        toast.success("Beoordeling opgeslagen");
      } catch {
        toast.error("Opslaan is mislukt.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Klopt het toegekende archetype, naar aanleiding van gesprekken of gedrag? Log dat hier, met een
        korte toelichting — dat geeft een geschiedenis op te bouwen van wat wel en niet klopte.
      </p>
      <Textarea
        placeholder="Toelichting (optioneel)"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => handleLog(true)}>
          Klopt
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => handleLog(false)}>
          Klopt niet
        </Button>
      </div>

      {assessments.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {assessments.map((a) => (
            <div key={a.id} className="rounded-md border border-border bg-card p-2 text-xs">
              <span className={a.matches ? "font-medium text-success" : "font-medium text-destructive"}>
                {a.matches ? "Klopt" : "Klopt niet"}
              </span>{" "}
              <span className="text-muted-foreground">· {formatDateTime(a.created_at)}</span>
              {a.explanation ? <p className="mt-0.5">{a.explanation}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
