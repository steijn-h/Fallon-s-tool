"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { reviewScoreDispute } from "@/lib/actions/score-disputes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/shared/page-header";

export interface ScoreDisputeRow {
  id: string;
  handle_name: string;
  current_score: number;
  requested_score: number;
  reason: string;
  requested_by_email: string;
  created_at: string;
}

export function ScoreDisputeReviewCard({ disputes }: { disputes: ScoreDisputeRow[] }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const router = useRouter();

  if (disputes.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SectionTitle>Openstaande aanvragen tot aanpassing</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Jij hebt alle rechten, dus jij beoordeelt deze aanvragen tot handmatige afwijking van de automatisch
          berekende score.
        </p>
        <div className="flex flex-col gap-2">
          {disputes.map((d) => (
            <div key={d.id} className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {d.handle_name}: {d.current_score} → {d.requested_score}
                </p>
                <span className="text-xs text-muted-foreground">{d.requested_by_email}</span>
              </div>
              <p className="text-xs text-muted-foreground">&ldquo;{d.reason}&rdquo;</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Feedback (optioneel)"
                  className="h-8 flex-1 text-xs"
                  value={feedback[d.id] ?? ""}
                  onChange={(e) => setFeedback((f) => ({ ...f, [d.id]: e.target.value }))}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await reviewScoreDispute(d.id, true, feedback[d.id] || null);
                        toast.success("Aanvraag goedgekeurd");
                        router.refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Mislukt.");
                      }
                    })
                  }
                >
                  Goedkeuren
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await reviewScoreDispute(d.id, false, feedback[d.id] || null);
                        toast.success("Aanvraag afgewezen");
                        router.refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Mislukt.");
                      }
                    })
                  }
                >
                  Afwijzen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
