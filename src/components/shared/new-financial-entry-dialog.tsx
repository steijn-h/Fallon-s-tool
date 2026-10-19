"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { addFinancialEntry } from "@/lib/actions/financial-entries";
import { Button } from "@/components/ui/button";
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
import { FINANCIAL_CATEGORY_LABELS, type FinancialEntryCategory } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type EventRow = Pick<Database["public"]["Tables"]["events"]["Row"], "id" | "name">;
type DeliverableOption = { id: string; label: string };

const CATEGORIES: FinancialEntryCategory[] = ["direct", "indirect", "goodwill"];

export function NewFinancialEntryDialog({
  events,
  deliverables,
}: {
  events: EventRow[];
  deliverables: DeliverableOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addFinancialEntry({ error: null }, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Post toegevoegd");
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Post toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Financiële post toevoegen</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventId">Evenement</Label>
              <select
                id="eventId"
                name="eventId"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Soort</Label>
              <select
                id="type"
                name="type"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="income">Inkomst</option>
                <option value="expense">Uitgave</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categorie</Label>
              <select
                id="category"
                name="category"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {FINANCIAL_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Bedrag (€)</Label>
              <Input id="amount" name="amount" type="number" min={0} step="0.01" defaultValue={0} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entryDate">Datum</Label>
              <Input id="entryDate" name="entryDate" type="date" defaultValue={today} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliverableId">Gekoppelde deliverable</Label>
              <select
                id="deliverableId"
                name="deliverableId"
                defaultValue=""
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Geen</option>
                {deliverables.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea id="description" name="description" rows={2} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig..." : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
