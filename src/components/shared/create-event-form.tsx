"use client";

import { useActionState, useRef, useEffect } from "react";

import { createEvent, type EventFormState } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: EventFormState = { error: null };

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createEvent, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-5 sm:items-end">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Locatie</Label>
        <Input id="location" name="location" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="start_date">Startdatum</Label>
        <Input id="start_date" name="start_date" type="date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="end_date">Einddatum</Label>
        <Input id="end_date" name="end_date" type="date" />
      </div>
      <div className="sm:col-span-5">
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Aanmaken..." : "Evenement toevoegen"}
        </Button>
      </div>
    </form>
  );
}
