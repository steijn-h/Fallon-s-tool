"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createSponsorship, type SponsorshipInput } from "@/lib/actions/sponsorships";
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
import { INDUSTRIES } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];

export function NewSponsorshipDialog({
  owners,
  events,
  packages,
}: {
  owners: OwnerRow[];
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
    const payload: SponsorshipInput = {
      company: String(formData.get("company") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      website: (formData.get("website") as string) || null,
      eventPackageId: String(formData.get("eventPackageId") ?? ""),
      value: Number(formData.get("value") ?? 0),
      startDate: String(formData.get("startDate")),
      endDate: String(formData.get("endDate")),
      ownerId: (formData.get("ownerId") as string) || null,
      notes: null,
      archetypeId: null,
      returnFocus: null,
    };

    startTransition(async () => {
      const result = await createSponsorship(payload);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nieuw sponsorschap
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw sponsorschap</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Bedrijfsnaam</Label>
            <Input id="company" name="company" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industry">Branche</Label>
            <select
              id="industry"
              name="industry"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          <EventPackageSelect events={events} packages={packages} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="value">Waarde (€)</Label>
            <Input id="value" name="value" type="number" min={0} defaultValue={0} />
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownerId">Dealverantwoordelijke</Label>
            <select
              id="ownerId"
              name="ownerId"
              defaultValue=""
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="">Niet toegewezen</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig..." : "Aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
