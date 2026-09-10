"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { CRITERION_CALCULATORS, type ScoringContext } from "@/lib/scoring/calculate";
import { createClient } from "@/lib/supabase/server";
import type { ScoreCriteriaPackageType, ScoreType } from "@/lib/supabase/database.types";

export interface ComputeScoreState {
  error: string | null;
}

const SCORE_TYPE_BY_PACKAGE: Record<ScoreCriteriaPackageType, ScoreType> = {
  b: "sponsor",
  c: "city",
};

export async function computeProfileScore(profileId: string): Promise<ComputeScoreState> {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id, created_at, archived_at")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    return { error: "Profiel niet gevonden." };
  }

  // The profile's own organization decides which score applies — for a
  // regular user this always matches their session (RLS guarantees it), but
  // a platform admin can trigger this for a profile outside their own org.
  const { data: profileOrg } = await supabase
    .from("organizations")
    .select("package_type")
    .eq("id", profile.organization_id)
    .single();
  if (profileOrg?.package_type !== "b" && profileOrg?.package_type !== "c") {
    return { error: "Dit pakket heeft geen berekende score." };
  }

  const packageType = profileOrg.package_type;
  const scoreType = SCORE_TYPE_BY_PACKAGE[packageType];

  const [
    { data: criteria },
    { data: relationshipScores },
    { data: tasks },
    { data: notes },
    { data: eventLinks },
    { data: leadSourceLink },
  ] = await Promise.all([
    supabase
      .from("score_criteria")
      .select("key, label, weight")
      .eq("package_type", packageType)
      .eq("active", true),
    supabase
      .from("relationship_scores")
      .select("score, recorded_at")
      .eq("profile_id", profileId)
      .eq("score_type", "relationship")
      .order("recorded_at", { ascending: false })
      .limit(2),
    supabase
      .from("tasks")
      .select("status, due_date, completed_at, created_at")
      .eq("profile_id", profileId),
    supabase
      .from("notes")
      .select("created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("profile_event_links").select("role").eq("profile_id", profileId),
    supabase
      .from("profile_lead_source")
      .select("lead_source_id")
      .eq("profile_id", profileId)
      .maybeSingle(),
  ]);

  if (!criteria || criteria.length === 0) {
    return {
      error:
        "Geen actieve scorecriteria geconfigureerd voor dit pakket. Voeg rijen toe aan score_criteria om een berekening mogelijk te maken.",
    };
  }

  let leadSource: ScoringContext["leadSource"] = null;
  if (leadSourceLink) {
    const { data: source } = await supabase
      .from("lead_sources")
      .select("name, quality_score")
      .eq("id", leadSourceLink.lead_source_id)
      .single();
    if (source) {
      leadSource = { name: source.name, qualityScore: source.quality_score };
    }
  }

  const latestTaskCreatedAt = (tasks ?? []).reduce<string | null>(
    (latest, task) => (!latest || task.created_at > latest ? task.created_at : latest),
    null,
  );
  const latestNoteCreatedAt = notes?.[0]?.created_at ?? null;
  const lastActivityAt =
    latestTaskCreatedAt && latestNoteCreatedAt
      ? latestTaskCreatedAt > latestNoteCreatedAt
        ? latestTaskCreatedAt
        : latestNoteCreatedAt
      : (latestTaskCreatedAt ?? latestNoteCreatedAt);

  const context: ScoringContext = {
    profileCreatedAt: profile.created_at,
    profileArchivedAt: profile.archived_at,
    relationshipScores: relationshipScores ?? [],
    tasks: (tasks ?? []).map((task) => ({
      status: task.status,
      due_date: task.due_date,
      completed_at: task.completed_at,
    })),
    lastActivityAt,
    eventLinks: eventLinks ?? [],
    leadSource,
    now: new Date(),
  };

  const components: {
    key: string;
    weight: number;
    value: number;
    explanation: string;
  }[] = [];

  for (const criterion of criteria) {
    const calculator = CRITERION_CALCULATORS[criterion.key];
    if (!calculator) continue; // unrecognized/custom criterion — skip rather than fail
    const result = calculator(context);
    components.push({ key: criterion.key, weight: criterion.weight, ...result });
  }

  if (components.length === 0) {
    return {
      error: "Geen van de geconfigureerde criteria kon berekend worden (onbekende criterium-keys).",
    };
  }

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const total =
    totalWeight > 0
      ? Math.round(
          (components.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight) * 100,
        ) / 100
      : 0;

  const runId = randomUUID();

  const { error: componentsError } = await supabase.from("score_components").insert(
    components.map((c) => ({
      profile_id: profileId,
      criterion_key: c.key,
      run_id: runId,
      value: c.value,
      weight_applied: c.weight,
      explanation: c.explanation,
    })),
  );

  if (componentsError) {
    return { error: "Wegschrijven van de deelscores is mislukt." };
  }

  const { error: totalError } = await supabase.from("relationship_scores").insert({
    profile_id: profileId,
    score_type: scoreType,
    score: total,
    run_id: runId,
    note: `Automatisch berekend op basis van ${components.length} criteria.`,
    recorded_by: session.userId,
  });

  if (totalError) {
    return { error: "Wegschrijven van het totaal is mislukt." };
  }

  revalidatePath(`/profiles/${profileId}`);
  return { error: null };
}
