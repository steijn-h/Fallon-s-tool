"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { unlinkProfileFromEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";

export function UnlinkEventButton({
  profileId,
  linkId,
}: {
  profileId: string;
  linkId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Koppeling met dit evenement verwijderen?")) return;
        startTransition(async () => {
          await unlinkProfileFromEvent(profileId, linkId);
          router.refresh();
        });
      }}
    >
      Ontkoppelen
    </Button>
  );
}
