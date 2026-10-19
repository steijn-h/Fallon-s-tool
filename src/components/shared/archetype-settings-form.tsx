"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateArchetypeSettings } from "@/lib/actions/archetype-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ArchetypeId } from "@/lib/types";

export function ArchetypeSettingsForm({
  archetypeId,
  imageUrl,
  notes,
}: {
  archetypeId: ArchetypeId;
  imageUrl: string | null;
  notes: string | null;
}) {
  const [imageUrlValue, setImageUrlValue] = useState(imageUrl ?? "");
  const [notesValue, setNotesValue] = useState(notes ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">Eigen aanvulling (alleen voor jullie organisatie)</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`image-${archetypeId}`} className="text-xs">
          Afbeelding (URL)
        </Label>
        <Input
          id={`image-${archetypeId}`}
          value={imageUrlValue}
          onChange={(e) => setImageUrlValue(e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`notes-${archetypeId}`} className="text-xs">
          Notities
        </Label>
        <Textarea
          id={`notes-${archetypeId}`}
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          rows={2}
          className="text-xs"
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await updateArchetypeSettings(archetypeId, {
                imageUrl: imageUrlValue.trim() || null,
                notes: notesValue.trim() || null,
              });
              toast.success("Opgeslagen");
            } catch {
              toast.error("Opslaan is mislukt.");
            }
          })
        }
      >
        Opslaan
      </Button>
    </div>
  );
}
