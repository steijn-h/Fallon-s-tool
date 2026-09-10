"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createLeadSource, setProfileLeadSource } from "@/lib/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LeadSourceForm({
  profileId,
  leadSources,
  currentLeadSourceId,
  currentNote,
}: {
  profileId: string;
  leadSources: { id: string; name: string }[];
  currentLeadSourceId: string | null;
  currentNote: string;
}) {
  const [pending, startTransition] = useTransition();
  const [newSourceName, setNewSourceName] = useState("");
  const router = useRouter();

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const leadSourceId = String(formData.get("lead_source_id"));
        const note = String(formData.get("note") ?? "");
        startTransition(async () => {
          let finalId = leadSourceId;
          if (leadSourceId === "__new__" && newSourceName.trim()) {
            finalId = await createLeadSource(newSourceName.trim());
          }
          if (finalId && finalId !== "__new__") {
            await setProfileLeadSource(profileId, finalId, note);
            router.refresh();
          }
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_source_id">Leadafkomst</Label>
        <select
          id="lead_source_id"
          name="lead_source_id"
          defaultValue={currentLeadSourceId ?? ""}
          onChange={(e) => {
            if (e.target.value !== "__new__") setNewSourceName("");
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="" disabled>
            Kies een bron
          </option>
          {leadSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
          <option value="__new__">+ Nieuwe bron toevoegen...</option>
        </select>
        <Input
          placeholder="Naam nieuwe bron"
          value={newSourceName}
          onChange={(e) => setNewSourceName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Toelichting</Label>
        <Input id="note" name="note" defaultValue={currentNote} placeholder="Optioneel" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Opslaan..." : "Opslaan"}
      </Button>
    </form>
  );
}
