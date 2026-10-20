import { ArchetypeAssessmentSection } from "@/components/shared/archetype-assessment-section";
import { ArchetypeSuggestionCard } from "@/components/shared/archetype-suggestion-card";
import { AssessmentBenchmarkChart } from "@/components/shared/assessment-benchmark-chart";
import { AssessmentHandleRow } from "@/components/shared/assessment-handle-row";
import { ScoreDisputeReviewCard } from "@/components/shared/score-dispute-review-card";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/page-header";
import { getCurrentSession } from "@/lib/auth/session";
import { archetypeById, suggestArchetypes, weightedTotalForArchetype, type Motivation } from "@/lib/archetypes";
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
  const session = await getCurrentSession();
  const [{ data: handles }, { data: scores }, { data: assessments }, { data: disputes }] = await Promise.all([
    supabase.from("handles").select("*").order("category"),
    supabase.from("assessment_scores").select("*").eq("sponsorship_id", sponsorshipId),
    supabase
      .from("archetype_assessments")
      .select("id, matches, explanation, created_at")
      .eq("sponsorship_id", sponsorshipId)
      .order("created_at", { ascending: false }),
    supabase
      .from("score_disputes")
      .select("id, handle_id, current_score, requested_score, reason, requested_by, created_at")
      .eq("sponsorship_id", sponsorshipId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const isReviewer = session?.accessLevel === "full" || session?.isPlatformAdmin;
  const requesterIds = [...new Set((disputes ?? []).map((d) => d.requested_by).filter(Boolean))] as string[];
  const { data: requesterEmails } =
    isReviewer && requesterIds.length > 0
      ? await supabase.rpc("list_own_organization_member_emails")
      : { data: [] as { user_id: string; email: string }[] };
  const emailByUserId = new Map((requesterEmails ?? []).map((m) => [m.user_id, m.email]));

  const scoreByHandleId = new Map((scores ?? []).map((s) => [s.handle_id, s.score]));
  const scoreByHandle = new Map((scores ?? []).map((s) => [s.handle_id, s]));
  const handleNameById = new Map((handles ?? []).map((h) => [h.id, h.name]));
  const disputeByHandleId = new Map((disputes ?? []).map((d) => [d.handle_id, d]));
  const archetype = archetypeById(archetypeId);
  const total = weightedTotalForArchetype(archetype, handles ?? [], scoreByHandleId);

  const suggestions = suggestArchetypes(handles ?? [], scoreByHandleId);
  const topSuggestion =
    suggestions.length > 0 && suggestions[0].total > 0
      ? { archetypeId: suggestions[0].archetype.id, name: suggestions[0].archetype.name, total: suggestions[0].total }
      : null;

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

      <ArchetypeSuggestionCard
        sponsorshipId={sponsorshipId}
        currentArchetypeId={archetypeId}
        topSuggestion={topSuggestion}
      />

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

      {isReviewer ? (
        <ScoreDisputeReviewCard
          disputes={(disputes ?? []).map((d) => ({
            id: d.id,
            handle_name: handleNameById.get(d.handle_id) ?? d.handle_id,
            current_score: d.current_score,
            requested_score: d.requested_score,
            reason: d.reason,
            requested_by_email: d.requested_by ? emailByUserId.get(d.requested_by) ?? d.requested_by : "onbekend",
            created_at: d.created_at,
          }))}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        {(handles ?? []).map((handle) => (
          <AssessmentHandleRow
            key={handle.id}
            sponsorshipId={sponsorshipId}
            handle={handle}
            existing={scoreByHandle.get(handle.id) ?? null}
            pendingDispute={disputeByHandleId.get(handle.id) ?? null}
          />
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Klopt dit archetype?</SectionTitle>
          <ArchetypeAssessmentSection
            sponsorshipId={sponsorshipId}
            archetypeId={archetypeId}
            assessments={assessments ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
