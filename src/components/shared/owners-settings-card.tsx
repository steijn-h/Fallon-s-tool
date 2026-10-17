"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { addOwner, deleteOwner, renameOwner } from "@/lib/actions/owners";
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
import { Input } from "@/components/ui/input";
import { OwnerAvatar } from "@/components/shared/owner-avatar";
import { SectionTitle } from "@/components/shared/page-header";
import type { Database } from "@/lib/supabase/database.types";

type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];

export function OwnersSettingsCard({
  owners,
  counts,
}: {
  owners: OwnerRow[];
  counts: Record<string, { prospects: number; sponsorships: number }>;
}) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <SectionTitle>Dealverantwoordelijken</SectionTitle>

        <div className="flex flex-col gap-2">
          {owners.map((owner) => {
            const c = counts[owner.id] ?? { prospects: 0, sponsorships: 0 };
            const isEditing = editingId === owner.id;

            return (
              <div key={owner.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5">
                <div className="flex flex-1 items-center gap-3">
                  <OwnerAvatar owner={owner} />
                  {isEditing ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 flex-1" />
                  ) : (
                    <div>
                      <p className="text-sm font-medium">{owner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.prospects} prospects · {c.sponsorships} sponsorschappen
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await renameOwner(owner.id, editName);
                            setEditingId(null);
                          })
                        }
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(owner.id);
                        setEditName(owner.name);
                      }}
                    >
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
                        <AlertDialogTitle>Dealverantwoordelijke verwijderen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {owner.name} wordt verwijderd. Gekoppelde prospects en sponsorschappen blijven
                          bestaan, maar raken hun dealverantwoordelijke kwijt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                        <AlertDialogAction onClick={() => startTransition(() => deleteOwner(owner.id))}>
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Naam nieuwe dealverantwoordelijke"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            type="button"
            disabled={pending || !newName.trim()}
            onClick={() =>
              startTransition(async () => {
                try {
                  await addOwner(newName);
                  setNewName("");
                  toast.success("Dealverantwoordelijke toegevoegd");
                } catch {
                  toast.error("Toevoegen is mislukt.");
                }
              })
            }
          >
            <Plus /> Toevoegen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
