// Pakket b (Standaard) — sponsorscore. Package-specific composition around
// the shared ComputedScoreCard, so pakket b's copy/labels can change without
// touching pakket c's stadsscore.
import { ComputedScoreCard } from "@/components/shared/computed-score-card";

export function SponsorScoreSection({ profileId }: { profileId: string }) {
  return (
    <ComputedScoreCard
      profileId={profileId}
      scoreType="sponsor"
      packageType="b"
      title="Sponsorscore"
      description="Optelsom van gewogen deelscores: relatietrend, taken op tijd, sponsorverleden en evenementbetrokkenheid."
    />
  );
}
