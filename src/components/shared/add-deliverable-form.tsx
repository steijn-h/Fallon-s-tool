"use client";

import { useActionState, useRef, useEffect } from "react";

import { addDeliverable, type DeliverableFormState } from "@/lib/actions/deliverables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: DeliverableFormState = { error: null };

export function AddDeliverableForm({ sponsorshipId }: { sponsorshipId: string }) {
  const action = addDeliverable.bind(null, sponsorshipId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Nieuwe deliverable</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Deadline</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Waarde (€)</Label>
        <Input id="value" name="value" type="number" min={0} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
      {state.error ? <p className="col-span-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
