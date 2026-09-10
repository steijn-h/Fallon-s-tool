"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { computeProfileScore } from "@/lib/actions/scoring";
import { Button } from "@/components/ui/button";

export function RecalculateScoreButton({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await computeProfileScore(profileId);
            if (result.error) {
              setError(result.error);
            } else {
              router.refresh();
            }
          });
        }}
      >
        {pending ? "Bezig met berekenen..." : "Bereken score"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
