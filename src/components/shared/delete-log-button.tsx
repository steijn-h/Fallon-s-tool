"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteConversationLog } from "@/lib/actions/conversation-logs";
import { Button } from "@/components/ui/button";

export function DeleteLogButton({ prospectId, logId }: { prospectId: string; logId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (!confirm("Dit gespreksverslag verwijderen?")) return;
        startTransition(async () => {
          await deleteConversationLog(prospectId, logId);
          router.refresh();
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
