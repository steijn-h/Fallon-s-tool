import { AssessmentBenchmarkChart } from "@/components/shared/assessment-benchmark-chart";
import { AssessmentHandleRow } from "@/components/shared/assessment-handle-row";
import { Card, CardContent } from "@/components/ui/card";
import { archetypeById, archetypeScoreForMotivation, type Motivation } from "@/lib/archetypes";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

const MOTIVATION_HANDLES: Record<string, keyof Motivation> = {
  "h-verbinding": "verbinding",
  "h-rendement": "competentie",
  "h-uitvoerbaarheid": "autonomie",
};

export async function AssessmentSection({
  sponsorshipId,
  archetypeId,
}: {
  sponsorshipId: string;
  archetypeId: ArchetypeId | null;
}) {
  const supabase = await createClient();
  const [{ data: handles }, { data: scores }] = await Promise.all([
    supabase.from("handles").select("*").order("category"),
    supabase.from("assessment_scores").select("*").eq("sponsorship_id", sponsorshipId),
  ]);

  const scoreByHandle = new Map((scores ?? []).map((s) => [s.handle_id, s]));
  const archetype = archetypeById(archetypeId);

  let weightedSum = 0;
  let weightTotal = 0;
  for (const handle of handles ?? []) {
    const existing = scoreByHandle.get(handle.id);
    if (!existing) continue;
    const value = archetype
      ? archetypeScoreForMotivation(archetype, handle.id, existing.score)
      : existing.score;
    weightedSum += value * handle.weight;
    weightTotal += handle.weight;
  }
  const total = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : null;

  const chartData = (handles ?? [])
    .filter((h) => scoreByHandle.has(h.id))
    .map((h) => {
      const dimension = MOTIVATION_HANDLES[h.id];
      const benchmark = archetype && dimension ? archetype.motivation[dimension] : 50;
      return { handle: h.name, score: scoreByHandle.get(h.id)!.score, benchmark };
    });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Gewogen beoordelingsscore</p>
            <p className="font-display text-2xl font-semibold">
              {total ?? "-"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span>
            </p>
          </div>
          {archetype ? (
            <p className="max-w-[50%] text-right text-xs text-muted-foreground">
              Gewogen o.b.v. archetype &ldquo;{archetype.name}&rdquo;
            </p>
          ) : (
            <p className="max-w-[50%] text-right text-xs text-muted-foreground">
              Geen archetype gekoppeld — ongewogen gemiddelde per handvat.
            </p>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 ? (
        <Card>
          <CardContent>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Score per handvat vs. archetype-benchmark
            </p>
            <AssessmentBenchmarkChart data={chartData} />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        {(handles ?? []).map((handle) => (
          <AssessmentHandleRow
            key={handle.id}
            sponsorshipId={sponsorshipId}
            handle={handle}
            existing={scoreByHandle.get(handle.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
