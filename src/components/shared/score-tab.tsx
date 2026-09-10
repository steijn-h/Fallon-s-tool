import { CityScoreSection } from "@/components/packages/c/city-score-section";
import { SponsorScoreSection } from "@/components/packages/b/sponsor-score-section";
import { AddScoreForm } from "@/components/shared/add-score-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { PackageType } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function ScoreTab({
  profileId,
  packageType,
}: {
  profileId: string;
  packageType: PackageType;
}) {
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("relationship_scores")
    .select("id, score, note, recorded_at, recorded_by")
    .eq("profile_id", profileId)
    .eq("score_type", "relationship")
    .order("recorded_at", { ascending: false });

  const current = history?.[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Huidige relatiescore</p>
            <p className="text-2xl font-semibold">
              {current ? current.score : "-"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span>
            </p>
          </div>
          {current ? (
            <Badge variant="secondary">Laatst bijgewerkt {formatDateTime(current.recorded_at)}</Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <AddScoreForm profileId={profileId} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Geschiedenis</p>
        {(history ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen scores vastgelegd.</p>
        ) : (
          (history ?? []).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-border bg-card p-3"
            >
              <div>
                <p className="text-sm font-medium">{entry.score} / 100</p>
                {entry.note ? <p className="text-sm text-muted-foreground">{entry.note}</p> : null}
              </div>
              <p className="text-xs text-muted-foreground">{formatDateTime(entry.recorded_at)}</p>
            </div>
          ))
        )}
      </div>

      {packageType === "b" ? (
        <div className="border-t border-border pt-4">
          <SponsorScoreSection profileId={profileId} />
        </div>
      ) : null}

      {packageType === "c" ? (
        <div className="border-t border-border pt-4">
          <CityScoreSection profileId={profileId} />
        </div>
      ) : null}
    </div>
  );
}
