"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { archiveProfile, unarchiveProfile } from "@/lib/actions/profiles";
import { Button } from "@/components/ui/button";

export function ArchiveProfileButton({
  profileId,
  archived,
}: {
  profileId: string;
  archived: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        const message = archived
          ? "Dit profiel herstellen uit het archief?"
          : "Dit profiel archiveren? Het blijft bewaard maar verdwijnt uit de standaardlijst.";
        if (!confirm(message)) return;
        startTransition(async () => {
          if (archived) {
            await unarchiveProfile(profileId);
          } else {
            await archiveProfile(profileId);
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Bezig..." : archived ? "Herstellen uit archief" : "Archiveren"}
    </Button>
  );
}
