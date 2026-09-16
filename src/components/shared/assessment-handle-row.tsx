"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { removeAssessmentScore, setAssessmentScore } from "@/lib/actions/assessment-scores";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Database } from "@/lib/supabase/database.types";

type Handle = Database["public"]["Tables"]["handles"]["Row"];
type Score = Database["public"]["Tables"]["assessment_scores"]["Row"];

const CATEGORY_LABELS: Record<string, string> = {
  archetype: "Archetype",
  individual: "Individueel",
  both: "Beide",
};

export function AssessmentHandleRow({
  sponsorshipId,
  handle,
  existing,
}: {
  sponsorshipId: string;
  handle: Handle;
  existing: Score | null;
}) {
  const [value, setValue] = useState(existing?.score ?? 50);
  const [note, setNote] = useState(existing?.note ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{handle.name}</p>
            {handle.description ? <p className="text-xs text-muted-foreground">{handle.description}</p> : null}
            <p className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[handle.category] ?? handle.category} · gewicht {handle.weight}
            </p>
          </div>
          <span className="font-display text-lg font-semibold">{value}</span>
        </div>
        <Slider value={[value]} onValueChange={([v]) => setValue(v ?? 0)} max={100} step={1} />
        <div className="flex items-center gap-2">
          <Input
            placeholder="Toelichting (optioneel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setAssessmentScore(sponsorshipId, handle.id, value, note || null);
                router.refresh();
              })
            }
          >
            Opslaan
          </Button>
          {existing ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await removeAssessmentScore(sponsorshipId, handle.id);
                  router.refresh();
                })
              }
            >
              Wissen
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
