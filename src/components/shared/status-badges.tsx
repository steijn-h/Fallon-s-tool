import { ColorBadge } from "@/components/shared/color-badge";
import {
  DELIVERABLE_META,
  STATUS_META,
  WARMTH_META,
  type DeliverableStatus,
  type LeadWarmth,
  type SponsorshipStatus,
} from "@/lib/types";

export function StatusBadge({ status }: { status: SponsorshipStatus }) {
  const meta = STATUS_META[status];
  return <ColorBadge label={meta.label} color={meta.color} />;
}

/** A sponsorship's package is data (per event, staff-editable), not a fixed
 * enum — so its label/color come straight from the event_packages row. */
export function EventPackageBadge({ name, color }: { name: string; color: string }) {
  return <ColorBadge label={name} color={color} />;
}

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const meta = DELIVERABLE_META[status];
  return <ColorBadge label={meta.label} color={meta.color} />;
}

export function WarmthBadge({ warmth }: { warmth: LeadWarmth }) {
  const meta = WARMTH_META[warmth];
  return <ColorBadge label={meta.label} color={meta.color} />;
}
