"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteHandle } from "@/lib/actions/handles";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/database.types";

type Handle = Database["public"]["Tables"]["handles"]["Row"];

export function HandleRow({ handle }: { handle: Handle }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium">{handle.name}</p>
        {handle.description ? <p className="text-sm text-muted-foreground">{handle.description}</p> : null}
        <p className="text-xs text-muted-foreground">Gewicht {handle.weight}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Handvat "${handle.name}" verwijderen?`)) return;
          startTransition(async () => {
            await deleteHandle(handle.id);
            router.refresh();
          });
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
