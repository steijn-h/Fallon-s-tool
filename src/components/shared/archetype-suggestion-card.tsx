"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setSponsorshipArchetype } from "@/lib/actions/archetype-assessments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ArchetypeId } from "@/lib/types";

export function ArchetypeSuggestionCard({
  sponsorshipId,
  currentArchetypeId,
  topSuggestion,
}: {
  sponsorshipId: string;
  currentArchetypeId: ArchetypeId | null;
  topSuggestion: { archetypeId: ArchetypeId; name: string; total: number } | null;
}) {
  const [pending, startTransition] = useTransition();

  if (!topSuggestion || topSuggestion.archetypeId === currentArchetypeId) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm">
          Op basis van de beoordelingsscores past <span className="font-medium">{topSuggestion.name}</span>{" "}
          het best ({topSuggestion.total}/100) — beter dan het huidige archetype.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await setSponsorshipArchetype(sponsorshipId, topSuggestion.archetypeId);
                toast.success("Archetype toegepast");
              } catch {
                toast.error("Toepassen is mislukt.");
              }
            })
          }
        >
          Toepassen
        </Button>
      </CardContent>
    </Card>
  );
}
