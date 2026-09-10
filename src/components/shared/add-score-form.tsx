"use client";

import { useActionState, useRef, useEffect } from "react";

import { addRelationshipScore, type ScoreFormState } from "@/lib/actions/scores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ScoreFormState = { error: null };

export function AddScoreForm({ profileId }: { profileId: string }) {
  const action = addRelationshipScore.bind(null, profileId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="score">Nieuwe score</Label>
        <Input id="score" name="score" type="number" min={0} max={100} step="1" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Toelichting</Label>
        <Input id="note" name="note" placeholder="Optioneel" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Opslaan..." : "Score toevoegen"}
      </Button>
      {state.error ? (
        <p className="col-span-full text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
