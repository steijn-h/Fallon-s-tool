"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { fileScoreDispute } from "@/lib/actions/score-disputes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/supabase/database.types";

type Handle = Database["public"]["Tables"]["handles"]["Row"];
type Score = Database["public"]["Tables"]["assessment_scores"]["Row"];
type Dispute = Pick<Database["public"]["Tables"]["score_disputes"]["Row"], "id" | "requested_score">;

const CATEGORY_LABELS: Record<string, string> = {
  archetype: "Archetype",
  individual: "Individueel",
  both: "Beide",
};

export function AssessmentHandleRow({
  sponsorshipId,
  handle,
  existing,
  pendingDispute,
}: {
  sponsorshipId: string;
  handle: Handle;
  existing: Score | null;
  pendingDispute: Dispute | null;
}) {
  const [open, setOpen] = useState(false);
  const [requestedScore, setRequestedScore] = useState(existing?.score ?? 50);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const score = existing?.score ?? null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{handle.name}</p>
            {handle.description ? <p className="text-xs text-muted-foreground">{handle.description}</p> : null}
            <p className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[handle.category] ?? handle.category} · gewicht {handle.weight}
            </p>
          </div>
          <span className="font-display text-lg font-semibold">{score ?? "-"}</span>
        </div>

        {existing?.explanation ? (
          <p className="rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">{existing.explanation}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nog geen score berekend — deze volgt automatisch zodra er activiteiten, deliverables of betalingen zijn
            vastgelegd.
          </p>
        )}

        {pendingDispute ? (
          <p className="text-xs text-amber-600">
            Aanvraag voor {pendingDispute.requested_score} staat open ter beoordeling.
          </p>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="w-fit">
                Score klopt niet? Vraag aanpassing aan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aanpassing aanvragen — {handle.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`requestedScore-${handle.id}`}>Gewenste score</Label>
                  <Input
                    id={`requestedScore-${handle.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={requestedScore}
                    onChange={(e) => setRequestedScore(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`reason-${handle.id}`}>Motivatie</Label>
                  <Textarea
                    id={`reason-${handle.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Waarom moet de score anders zijn dan de automatisch berekende score?"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    disabled={pending || !reason.trim()}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await fileScoreDispute(sponsorshipId, handle.id, score ?? 0, requestedScore, reason);
                          toast.success("Aanvraag ingediend");
                          setOpen(false);
                          setReason("");
                          router.refresh();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Indienen is mislukt.");
                        }
                      })
                    }
                  >
                    {pending ? "Bezig..." : "Aanvraag indienen"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
