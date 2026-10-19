"use client";

import { useState, useTransition } from "react";
import { ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";

import { convertProspectToSponsorship } from "@/lib/actions/prospects";
import { EventPackageSelect } from "@/components/shared/event-package-select";
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
import type { Database } from "@/lib/supabase/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];

export function ConvertToSponsorshipDialog({
  prospectId,
  estValue,
  events,
  packages,
}: {
  prospectId: string;
  estValue: number;
  events: EventRow[];
  packages: EventPackageRow[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .slice(0, 10);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await convertProspectToSponsorship(prospectId, {
        eventPackageId: String(formData.get("eventPackageId") ?? ""),
        value: Number(formData.get("value") ?? 0),
        startDate: String(formData.get("startDate")),
        endDate: String(formData.get("endDate")),
      });
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightCircle /> Converteren naar sponsorschap
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converteren naar sponsorschap</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <EventPackageSelect events={events} packages={packages} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="value">Waarde (€)</Label>
            <Input id="value" name="value" type="number" min={0} defaultValue={estValue} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={today} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">Einddatum</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={nextYear} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig..." : "Converteren"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
