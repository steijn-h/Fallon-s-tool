"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateSponsorship, type SponsorshipInput } from "@/lib/actions/sponsorships";
import { EventPackageSelect } from "@/components/shared/event-package-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARCHETYPES } from "@/lib/archetypes";
import { INDUSTRIES, RETURN_LABELS, type ArchetypeId, type ReturnType } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type SponsorshipRow = Database["public"]["Tables"]["sponsorships"]["Row"];
type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];

const RETURN_TYPES: ReturnType[] = ["ROI", "ROO", "ROE", "ROA", "ROCI", "ROKI", "ROK"];

export function SponsorshipForm({
  sponsorship,
  owners,
  events,
  packages,
}: {
  sponsorship: SponsorshipRow;
  owners: OwnerRow[];
  events: EventRow[];
  packages: EventPackageRow[];
}) {
  const [pending, startTransition] = useTransition();
  const currentPackage = packages.find((p) => p.id === sponsorship.event_package_id);

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
      notes: (formData.get("notes") as string) || null,
      archetypeId: ((formData.get("archetypeId") as string) || null) as ArchetypeId | null,
      returnFocus: ((formData.get("returnFocus") as string) || null) as ReturnType | null,
    };

    startTransition(async () => {
      const result = await updateSponsorship(sponsorship.id, payload);
      if (result?.error) toast.error(result.error);
      else toast.success("Opgeslagen");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Bedrijfsnaam</Label>
          <Input id="company" name="company" defaultValue={sponsorship.company} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">Branche</Label>
          <select
            id="industry"
            name="industry"
            defaultValue={sponsorship.industry}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={sponsorship.website ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">Waarde (€)</Label>
          <Input id="value" name="value" type="number" min={0} defaultValue={sponsorship.value} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ownerId">Dealverantwoordelijke</Label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={sponsorship.owner_id ?? ""}
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Startdatum</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={sponsorship.start_date} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">Einddatum</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={sponsorship.end_date} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="archetypeId">Archetype</Label>
          <select
            id="archetypeId"
            name="archetypeId"
            defaultValue={sponsorship.archetype_id ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="">Nog geen archetype</option>
            {ARCHETYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="returnFocus">Return-focus</Label>
          <select
            id="returnFocus"
            name="returnFocus"
            defaultValue={sponsorship.return_focus ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="">Niet bepaald</option>
            {RETURN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type} — {RETURN_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <EventPackageSelect
        events={events}
        packages={packages}
        defaultEventId={currentPackage?.event_id}
        defaultPackageId={sponsorship.event_package_id}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notities</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={sponsorship.notes ?? ""} />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Opslaan..." : "Wijzigingen opslaan"}
        </Button>
      </div>
    </form>
  );
}
