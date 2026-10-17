"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setSponsorshipStatus } from "@/lib/actions/sponsorships";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_META, type SponsorshipStatus } from "@/lib/types";

export function SponsorshipStatusSelect({
  sponsorshipId,
  status,
}: {
  sponsorshipId: string;
  status: SponsorshipStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          await setSponsorshipStatus(sponsorshipId, value as SponsorshipStatus);
          router.refresh();
        })
      }
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_META).map(([value, meta]) => (
          <SelectItem key={value} value={value}>
            {meta.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
