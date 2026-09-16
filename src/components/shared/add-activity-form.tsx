"use client";

import { useActionState, useRef, useEffect } from "react";

import { addActivity, type ActivityFormState } from "@/lib/actions/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const initialState: ActivityFormState = { error: null };

export function AddActivityForm({ sponsorshipId }: { sponsorshipId: string }) {
  const action = addActivity.bind(null, sponsorshipId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <Card>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="call">Telefoongesprek</option>
              <option value="email">E-mail</option>
              <option value="meeting">Afspraak</option>
              <option value="note">Notitie</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Bezig..." : "Toevoegen"}
          </Button>
          {state.error ? <p className="col-span-full text-sm text-destructive">{state.error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
