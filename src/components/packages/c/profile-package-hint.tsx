// Pakket c (Citymarketing) — profile detail sidebar hint.
// Package-specific UI lives in this folder so pakket c can be extended
// (bv. later: stadsscore, persona-matching) without touching pakket a of b.
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePackageHint() {
  return (
    <Card>
      <CardContent className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Citymarketingpakket</p>
        <p className="mt-1">
          Ken een archetype toe op het tabblad &ldquo;NAWTE&rdquo;. Dit legt nu alleen de relatie
          vast — automatische matching aan persona&apos;s volgt in een latere fase.
        </p>
      </CardContent>
    </Card>
  );
}
