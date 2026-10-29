"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";

type EventRow = { id: string; name: string };
type PackageRow = { id: string; event_id: string; name: string };

export function EventPackageSelect({
  events,
  packages,
  defaultEventId,
  defaultPackageId,
}: {
  events: EventRow[];
  packages: PackageRow[];
  defaultEventId?: string;
  defaultPackageId?: string;
}) {
  const [eventId, setEventId] = useState(defaultEventId ?? events[0]?.id ?? "");

  const packagesForEvent = useMemo(
    () => packages.filter((p) => p.event_id === eventId),
    [packages, eventId],
  );

  const [packageId, setPackageId] = useState(
    defaultPackageId && packages.some((p) => p.id === defaultPackageId && p.event_id === eventId)
      ? defaultPackageId
      : packagesForEvent[0]?.id ?? "",
  );

  function handleEventChange(newEventId: string) {
    setEventId(newEventId);
    const first = packages.find((p) => p.event_id === newEventId);
    setPackageId(first?.id ?? "");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="eventId">Evenement</Label>
        <select
          id="eventId"
          value={eventId}
          onChange={(e) => handleEventChange(e.target.value)}
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
        <Label htmlFor="eventPackageId">Pakket</Label>
        <select
          id="eventPackageId"
          name="eventPackageId"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          {packagesForEvent.length === 0 ? (
            <option value="">Geen pakketten voor dit evenement</option>
          ) : (
            packagesForEvent.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
