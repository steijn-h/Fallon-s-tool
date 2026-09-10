// Pakket c (Citymarketing) — stadsscore. Package-specific composition around
// the shared ComputedScoreCard, so pakket c's copy/labels can change without
// touching pakket b's sponsorscore.
import { ComputedScoreCard } from "@/components/shared/computed-score-card";

export function CityScoreSection({ profileId }: { profileId: string }) {
  return (
    <ComputedScoreCard
      profileId={profileId}
      scoreType="city"
      packageType="c"
      title="Stadsscore"
      description="Optelsom van gewogen deelscores: relatietrend, bijdrage aan stadsevenementen en kwaliteit van de leadafkomst."
    />
  );
}
