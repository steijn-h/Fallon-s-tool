"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { bulkAddActivity, bulkAddReciprocalPerformance } from "@/lib/actions/bulk-sponsorship-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SectionTitle } from "@/components/shared/page-header";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityType } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

const BULK_ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Telefoongesprek" },
  { value: "email", label: "E-mail" },
  { value: "meeting", label: "Afspraak" },
  { value: "note", label: "Notitie" },
  { value: "contract", label: "Contract" },
];

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];
type SponsorshipRow = Pick<Database["public"]["Tables"]["sponsorships"]["Row"], "id" | "company" | "event_package_id">;
type PerformanceRow = Database["public"]["Tables"]["reciprocal_performances"]["Row"];

function SponsorCheckboxList({
  sponsorships,
  selected,
  onToggle,
}: {
  sponsorships: SponsorshipRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {sponsorships.map((s) => (
        <label key={s.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm">
          <Checkbox checked={selected.has(s.id)} onCheckedChange={() => onToggle(s.id)} />
          {s.company}
        </label>
      ))}
    </div>
  );
}

function BulkActivityDialog({ sponsorshipIds }: { sponsorshipIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ActivityType>("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={sponsorshipIds.length === 0}>
          Activiteit toevoegen ({sponsorshipIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activiteit toevoegen voor {sponsorshipIds.length} sponsor(s)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              {BULK_ACTIVITY_TYPES.map((meta) => (
                <option key={meta.value} value={meta.value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Titel</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Omschrijving</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={pending || !title.trim()}
            onClick={() =>
              startTransition(async () => {
                const result = await bulkAddActivity(sponsorshipIds, type, title, description || null);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success(`Toegevoegd voor ${result.successCount} sponsor(s)`);
                  setOpen(false);
                  setTitle("");
                  setDescription("");
                }
              })
            }
          >
            {pending ? "Bezig..." : "Toevoegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkPerformanceDialog({
  sponsorshipIds,
  suggestions,
}: {
  sponsorshipIds: string[];
  suggestions: PerformanceRow[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={sponsorshipIds.length === 0}>
          Wederkerige prestatie toevoegen ({sponsorshipIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wederkerige prestatie voor {sponsorshipIds.length} sponsor(s)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <Label>Uit pakket-sjabloon kiezen (optioneel)</Label>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTitle(s.title);
                      setDescription(s.description ?? "");
                    }}
                  >
                    {s.title}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label>Titel</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="bijv. logo op backboard geplaatst"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Omschrijving</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Deadline (optioneel)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={pending || !title.trim()}
            onClick={() =>
              startTransition(async () => {
                const result = await bulkAddReciprocalPerformance(
                  sponsorshipIds,
                  title,
                  description || null,
                  dueDate || null,
                );
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success(`Toegevoegd voor ${result.successCount} sponsor(s)`);
                  setOpen(false);
                  setTitle("");
                  setDescription("");
                  setDueDate("");
                }
              })
            }
          >
            {pending ? "Bezig..." : "Toevoegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventBulkCard({
  event,
  sponsorships,
  performances,
}: {
  event: EventRow;
  sponsorships: SponsorshipRow[];
  performances: PerformanceRow[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(sponsorships.map((s) => s.id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (sponsorships.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SectionTitle>
          {event.name} <span className="font-normal text-muted-foreground">· {sponsorships.length} sponsor(s)</span>
        </SectionTitle>
        <SponsorCheckboxList sponsorships={sponsorships} selected={selected} onToggle={toggle} />
        <div className="flex flex-wrap gap-2">
          <BulkActivityDialog sponsorshipIds={[...selected]} />
          <BulkPerformanceDialog sponsorshipIds={[...selected]} suggestions={performances} />
        </div>
      </CardContent>
    </Card>
  );
}

export function EventsBulkView({
  events,
  packages,
  sponsorships,
  performances,
}: {
  events: EventRow[];
  packages: EventPackageRow[];
  sponsorships: SponsorshipRow[];
  performances: PerformanceRow[];
}) {
  const packageEventId = useMemo(() => new Map(packages.map((p) => [p.id, p.event_id])), [packages]);
  const packageIdsByEventId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const pkg of packages) {
      const list = map.get(pkg.event_id) ?? [];
      list.push(pkg.id);
      map.set(pkg.event_id, list);
    }
    return map;
  }, [packages]);

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => {
        const eventSponsorships = sponsorships.filter((s) => packageEventId.get(s.event_package_id) === event.id);
        const eventPackageIds = new Set(packageIdsByEventId.get(event.id) ?? []);
        const eventPerformances = performances.filter((p) => eventPackageIds.has(p.event_package_id));
        return (
          <EventBulkCard
            key={event.id}
            event={event}
            sponsorships={eventSponsorships}
            performances={eventPerformances}
          />
        );
      })}
      {events.every((event) => sponsorships.filter((s) => packageEventId.get(s.event_package_id) === event.id).length === 0) ? (
        <p className="text-sm text-muted-foreground">Nog geen sponsorschappen gekoppeld aan een evenement.</p>
      ) : null}
    </div>
  );
}
