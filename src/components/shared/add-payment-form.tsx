"use client";

import { useActionState, useRef, useEffect } from "react";

import { addPayment, type PaymentFormState } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PaymentFormState = { error: null };

export function AddPaymentForm({ sponsorshipId }: { sponsorshipId: string }) {
  const action = addPayment.bind(null, sponsorshipId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invoiceNo">Factuurnummer</Label>
        <Input id="invoiceNo" name="invoiceNo" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Bedrag (€)</Label>
        <Input id="amount" name="amount" type="number" min={0} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Vervaldatum</Label>
        <Input id="dueDate" name="dueDate" type="date" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
      {state.error ? <p className="col-span-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
