"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { resetAllData } from "@/lib/actions/reset";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/page-header";
import { currency } from "@/lib/format";

export function DataResetCard({
  prospectCount,
  sponsorshipCount,
  totalContractValue,
  totalCollected,
}: {
  prospectCount: number;
  sponsorshipCount: number;
  totalContractValue: number;
  totalCollected: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <SectionTitle>Data &amp; opslag</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Prospects</p>
            <p className="font-display text-lg font-semibold">{prospectCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sponsorschappen</p>
            <p className="font-display text-lg font-semibold">{sponsorshipCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Totale contractwaarde</p>
            <p className="font-display text-lg font-semibold">{currency(totalContractValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Geïnd</p>
            <p className="font-display text-lg font-semibold">{currency(totalCollected)}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="w-fit">
              Reset naar standaarddata
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alle data verwijderen?</AlertDialogTitle>
              <AlertDialogDescription>
                Dit verwijdert alle prospects en sponsorschappen (inclusief contacten, taken,
                gespreksverslagen, deliverables, betalingen en beoordelingen) en zet de jaartargets
                terug naar de standaardwaarden. Eigenaren, pipeline-fases en handvatten blijven
                behouden. Dit kan niet ongedaan worden gemaakt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await resetAllData();
                    toast.success("Data gereset");
                  })
                }
              >
                Definitief resetten
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
