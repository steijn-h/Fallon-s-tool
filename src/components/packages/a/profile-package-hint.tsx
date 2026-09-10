// Pakket a (Evenementen) — profile detail sidebar hint.
// Package-specific UI lives in this folder so pakket a can be extended
// (e.g. more event-oriented fields) without touching pakket b or c.
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePackageHint() {
  return (
    <Card>
      <CardContent className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Evenementenpakket</p>
        <p className="mt-1">
          Koppel dit profiel aan een editie op het tabblad &ldquo;Evenementen&rdquo; om de rol
          (lead of sponsor) per editie bij te houden.
        </p>
      </CardContent>
    </Card>
  );
}
