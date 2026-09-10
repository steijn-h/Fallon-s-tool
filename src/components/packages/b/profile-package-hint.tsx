// Pakket b (Standaard) — profile detail sidebar hint.
// Package-specific UI lives in this folder so pakket b can be extended
// without touching pakket a or c.
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePackageHint() {
  return (
    <Card>
      <CardContent className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Standaardpakket</p>
        <p className="mt-1">
          NAWTE, taken, notities en relatiescore zijn beschikbaar. Evenementkoppelingen en
          archetypes horen bij de pakketten Evenementen en Citymarketing.
        </p>
      </CardContent>
    </Card>
  );
}
