"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { linkProfileToEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProfileEventRole } from "@/lib/supabase/database.types";

export function LinkEventForm({
  profileId,
  events,
}: {
  profileId: string;
  events: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Geen (overige) evenementen beschikbaar om aan te koppelen.
      </p>
    );
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const eventId = String(formData.get("event_id"));
        const role = formData.get("role") as ProfileEventRole;
        startTransition(async () => {
          await linkProfileToEvent(profileId, eventId, role);
          router.refresh();
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="event_id">Evenement</Label>
        <select
          id="event_id"
          name="event_id"
          required
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          name="role"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="sponsor">Sponsor</option>
          <option value="lead">Lead</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Koppelen..." : "Koppelen"}
      </Button>
    </form>
  );
}
