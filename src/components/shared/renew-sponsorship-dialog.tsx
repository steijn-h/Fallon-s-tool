"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { renewSponsorship } from "@/lib/actions/sponsorships";
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

export function RenewSponsorshipDialog({
  sponsorshipId,
  currentEndDate,
  currentValue,
}: {
  sponsorshipId: string;
  currentEndDate: string;
  currentValue: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const suggestedStart = currentEndDate;
  const suggestedEnd = new Date(new Date(currentEndDate).setFullYear(new Date(currentEndDate).getFullYear() + 1))
    .toISOString()
    .slice(0, 10);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await renewSponsorship(sponsorshipId, {
        startDate: String(formData.get("startDate")),
        endDate: String(formData.get("endDate")),
        value: Number(formData.get("value") ?? 0),
      });
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCw /> Verlengen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sponsorschap verlengen</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={suggestedStart} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">Einddatum</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={suggestedEnd} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="value">Waarde (€)</Label>
            <Input id="value" name="value" type="number" min={0} defaultValue={currentValue} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig..." : "Verlengen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
