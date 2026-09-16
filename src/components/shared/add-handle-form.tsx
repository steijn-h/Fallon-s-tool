"use client";

import { useActionState, useRef, useEffect } from "react";

import { addHandle, type HandleFormState } from "@/lib/actions/handles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: HandleFormState = { error: null };

export function AddHandleForm() {
  const [state, formAction, pending] = useActionState(addHandle, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categorie</Label>
          <select
            id="category"
            name="category"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="both">Beide</option>
            <option value="archetype">Archetype</option>
            <option value="individual">Individueel</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weight">Gewicht (1-5)</Label>
          <Input id="weight" name="weight" type="number" min={1} max={5} defaultValue={3} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Omschrijving</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Toevoegen..." : "Handvat toevoegen"}
        </Button>
      </div>
    </form>
  );
}
