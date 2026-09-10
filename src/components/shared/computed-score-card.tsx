import { RecalculateScoreButton } from "@/components/shared/recalculate-score-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ScoreCriteriaPackageType, ScoreType } from "@/lib/supabase/database.types";

export async function ComputedScoreCard({
  profileId,
  scoreType,
  packageType,
  title,
  description,
}: {
  profileId: string;
  scoreType: ScoreType;
  packageType: ScoreCriteriaPackageType;
  title: string;
  description: string;
}) {
  const supabase = await createClient();

  const [{ data: history }, { data: criteria }] = await Promise.all([
    supabase
      .from("relationship_scores")
      .select("score, recorded_at, run_id, note")
      .eq("profile_id", profileId)
      .eq("score_type", scoreType)
      .order("recorded_at", { ascending: false }),
    supabase.from("score_criteria").select("key, label").eq("package_type", packageType),
  ]);

  const labelByKey = new Map((criteria ?? []).map((c) => [c.key, c.label]));
  const latest = history?.[0] ?? null;

  const { data: latestComponents } = latest?.run_id
    ? await supabase
        .from("score_components")
        .select("criterion_key, value, weight_applied, explanation")
        .eq("run_id", latest.run_id)
    : { data: null };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <RecalculateScoreButton profileId={profileId} />
        </div>

        {latest ? (
          <>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
              <div>
                <p className="text-2xl font-semibold">
                  {latest.score}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span>
                </p>
                <p className="text-xs text-muted-foreground">{latest.note}</p>
              </div>
              <Badge variant="secondary">Berekend {formatDateTime(latest.recorded_at)}</Badge>
            </div>

            {(latestComponents ?? []).length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">Deelscores</p>
                {(latestComponents ?? []).map((component) => (
                  <div
                    key={component.criterion_key}
                    className="flex items-start justify-between gap-3 rounded-md border border-border p-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {labelByKey.get(component.criterion_key) ?? component.criterion_key}
                      </p>
                      <p className="text-sm text-muted-foreground">{component.explanation}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      <p className="font-medium">{component.value} / 100</p>
                      <p className="text-xs text-muted-foreground">gewicht {component.weight_applied}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {history && history.length > 1 ? (
              <div className="flex flex-col gap-1 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Geschiedenis</p>
                {history.slice(1).map((entry, index) => (
                  <div
                    key={`${entry.run_id ?? "manual"}-${index}`}
                    className="flex items-center justify-between text-sm text-muted-foreground"
                  >
                    <span>{formatDateTime(entry.recorded_at)}</span>
                    <span>{entry.score} / 100</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nog niet berekend. Klik op &ldquo;Bereken score&rdquo; om de eerste meting te maken.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
