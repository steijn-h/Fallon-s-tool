"use client";

import { useActionState, useRef, useEffect } from "react";

import { addConversationLog, type LogFormState } from "@/lib/actions/conversation-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: LogFormState = { error: null };

export function AddConversationLogForm({ prospectId }: { prospectId: string }) {
  const action = addConversationLog.bind(null, prospectId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Datum</Label>
          <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactType">Type contact</Label>
          <select
            id="contactType"
            name="contactType"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="telefoon">Telefoon</option>
            <option value="email">E-mail</option>
            <option value="persoonlijk">Persoonlijk</option>
            <option value="teams">Teams</option>
            <option value="anders">Anders</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="summary">Samenvatting</Label>
        <Input id="summary" name="summary" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Details</Label>
        <Textarea id="content" name="content" rows={3} />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Toevoegen..." : "Gespreksverslag toevoegen"}
        </Button>
      </div>
    </form>
  );
}
