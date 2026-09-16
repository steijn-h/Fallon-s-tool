import { ColorBadge } from "@/components/shared/color-badge";
import {
  DELIVERABLE_META,
  STATUS_META,
  TIER_COLORS,
  WARMTH_META,
  type DeliverableStatus,
  type LeadWarmth,
  type SponsorshipStatus,
  type SponsorshipTier,
} from "@/lib/types";

export function StatusBadge({ status }: { status: SponsorshipStatus }) {
  const meta = STATUS_META[status];
  return <ColorBadge label={meta.label} color={meta.color} />;
}

export function TierBadge({ tier }: { tier: SponsorshipTier }) {
  return <ColorBadge label={tier} color={TIER_COLORS[tier]} />;
}

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const meta = DELIVERABLE_META[status];
  return <ColorBadge label={meta.label} color={meta.color} />;
}

export function WarmthBadge({ warmth }: { warmth: LeadWarmth }) {
  const meta = WARMTH_META[warmth];
  return <ColorBadge label={meta.label} color={meta.color} />;
}
