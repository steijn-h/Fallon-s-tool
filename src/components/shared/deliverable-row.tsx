"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateDeliverableStatus } from "@/lib/actions/deliverables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeliverableStatusBadge } from "@/components/shared/status-badges";
import { formatDate, relativeDays, currency } from "@/lib/format";
import { DELIVERABLE_META, type DeliverableStatus } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type Deliverable = Pick<
  Database["public"]["Tables"]["deliverables"]["Row"],
  "id" | "title" | "description" | "status" | "due_date" | "value"
>;

export function DeliverableRow({
  sponsorshipId,
  deliverable,
}: {
  sponsorshipId: string;
  deliverable: Deliverable;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const days = relativeDays(deliverable.due_date);
  const isOverdue = deliverable.status !== "delivered" && days !== null && days < 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium">{deliverable.title}</p>
        {deliverable.description ? (
          <p className="text-sm text-muted-foreground">{deliverable.description}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Deadline: {formatDate(deliverable.due_date)}
          {deliverable.value ? ` · ${currency(deliverable.value)}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isOverdue ? <DeliverableStatusBadge status="overdue" /> : <DeliverableStatusBadge status={deliverable.status} />}
        <Select
          defaultValue={deliverable.status}
          disabled={pending}
          onValueChange={(value) =>
            startTransition(async () => {
              await updateDeliverableStatus(sponsorshipId, deliverable.id, value as DeliverableStatus);
              router.refresh();
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DELIVERABLE_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
