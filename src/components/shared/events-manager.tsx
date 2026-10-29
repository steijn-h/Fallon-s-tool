"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  addEvent,
  addEventPackage,
  deleteEvent,
  deleteEventPackage,
  renameEvent,
  renameEventPackage,
} from "@/lib/actions/events";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventPackageDetailDialog } from "@/components/shared/event-package-detail-dialog";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/shared/page-header";
import { currency } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];
type PriceRow = Database["public"]["Tables"]["event_package_prices"]["Row"];
type PerformanceRow = Database["public"]["Tables"]["reciprocal_performances"]["Row"];
type ActionRow = Database["public"]["Tables"]["reciprocal_performance_actions"]["Row"];

function EventPackageRowItem({
  pkg,
  prices,
  performances,
  actionsByPerformanceId,
}: {
  pkg: EventPackageRow;
  prices: PriceRow[];
  performances: PerformanceRow[];
  actionsByPerformanceId: Map<string, ActionRow[]>;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pkg.name);
  const [value, setValue] = useState(pkg.value);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm">
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 flex-1" />
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-7 w-28"
          />
        </div>
      ) : (
        <span>
          {pkg.name} <span className="text-muted-foreground">· {currency(pkg.value)}</span>
        </span>
      )}
      <div className="flex items-center gap-1">
        <EventPackageDetailDialog
          packageId={pkg.id}
          packageName={pkg.name}
          prices={prices}
          performances={performances}
          actionsByPerformanceId={actionsByPerformanceId}
        />
        {editing ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await renameEventPackage(pkg.id, name, value);
                    setEditing(false);
                  } catch {
                    toast.error("Bijwerken is mislukt.");
                  }
                })
              }
            >
              <Check className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(false)}>
              <X className="size-3.5" />
            </Button>
          </>
        ) : (
          <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="icon">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pakket verwijderen?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{pkg.name}&rdquo; wordt verwijderd. Dit kan alleen als er geen sponsorschappen meer
                aan dit pakket hangen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await deleteEventPackage(pkg.id);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Verwijderen is mislukt.");
                    }
                  })
                }
              >
                Verwijderen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function EventRowItem({
  event,
  packages,
  pricesByPackageId,
  performancesByPackageId,
  actionsByPerformanceId,
}: {
  event: EventRow;
  packages: EventPackageRow[];
  pricesByPackageId: Map<string, PriceRow[]>;
  performancesByPackageId: Map<string, PerformanceRow[]>;
  actionsByPerformanceId: Map<string, ActionRow[]>;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(event.name);
  const [newPackageName, setNewPackageName] = useState("");

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 flex-1" />
        ) : (
          <p className="text-sm font-medium">{event.name}</p>
        )}
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await renameEvent(event.id, name);
                      setEditing(false);
                    } catch {
                      toast.error("Bijwerken is mislukt.");
                    }
                  })
                }
              >
                <Check className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(false)}>
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Evenement verwijderen?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{event.name}&rdquo; en al zijn pakketten worden verwijderd. Dit kan alleen als er
                  geen sponsorschappen meer onder hangen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await deleteEvent(event.id);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Verwijderen is mislukt.");
                      }
                    })
                  }
                >
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pl-1">
        {packages.map((pkg) => (
          <EventPackageRowItem
            key={pkg.id}
            pkg={pkg}
            prices={pricesByPackageId.get(pkg.id) ?? []}
            performances={performancesByPackageId.get(pkg.id) ?? []}
            actionsByPerformanceId={actionsByPerformanceId}
          />
        ))}
      </div>

      <div className="flex gap-2 pl-1">
        <Input
          placeholder="Naam nieuw pakket"
          value={newPackageName}
          onChange={(e) => setNewPackageName(e.target.value)}
          className="h-8"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !newPackageName.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await addEventPackage(event.id, newPackageName, 0);
                setNewPackageName("");
              } catch {
                toast.error("Toevoegen is mislukt.");
              }
            })
          }
        >
          <Plus className="size-3.5" /> Pakket
        </Button>
      </div>
    </div>
  );
}

export function EventsManager({
  events,
  packages,
  prices,
  performances,
  actions,
}: {
  events: EventRow[];
  packages: EventPackageRow[];
  prices: PriceRow[];
  performances: PerformanceRow[];
  actions: ActionRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [newEventName, setNewEventName] = useState("");

  const pricesByPackageId = new Map<string, PriceRow[]>();
  for (const p of prices) {
    const list = pricesByPackageId.get(p.event_package_id) ?? [];
    list.push(p);
    pricesByPackageId.set(p.event_package_id, list);
  }
  const performancesByPackageId = new Map<string, PerformanceRow[]>();
  for (const p of performances) {
    const list = performancesByPackageId.get(p.event_package_id) ?? [];
    list.push(p);
    performancesByPackageId.set(p.event_package_id, list);
  }
  const actionsByPerformanceId = new Map<string, ActionRow[]>();
  for (const a of actions) {
    const list = actionsByPerformanceId.get(a.reciprocal_performance_id) ?? [];
    list.push(a);
    actionsByPerformanceId.set(a.reciprocal_performance_id, list);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SectionTitle>Evenementen & pakketten</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Elk evenement heeft zijn eigen set sponsorpakketten. Klik op het schuifjes-icoon bij een pakket
          voor de prijsgeschiedenis (per jaar, met kostprijs) en de wederkerige prestaties die erbij horen.
        </p>

        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <EventRowItem
              key={event.id}
              event={event}
              packages={packages.filter((p) => p.event_id === event.id)}
              pricesByPackageId={pricesByPackageId}
              performancesByPackageId={performancesByPackageId}
              actionsByPerformanceId={actionsByPerformanceId}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Naam nieuw evenement"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
          <Button
            type="button"
            disabled={pending || !newEventName.trim()}
            onClick={() =>
              startTransition(async () => {
                try {
                  await addEvent(newEventName);
                  setNewEventName("");
                  toast.success("Evenement toegevoegd");
                } catch {
                  toast.error("Toevoegen is mislukt.");
                }
              })
            }
          >
            <Plus /> Evenement toevoegen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
