import { formatDate } from "@/lib/format";
import type { ProfileEventRole, TaskStatus } from "@/lib/supabase/database.types";

/**
 * Pure scoring logic: given already-fetched raw data about a profile, work
 * out each criterion's 0-100 sub-score and a human-readable explanation.
 * No database access happens here — see lib/actions/scoring.ts for the
 * fetch/write orchestration. Keeping this pure makes each criterion easy to
 * read and change independently of how the data was loaded.
 */

export interface ScoringContext {
  profileCreatedAt: string;
  profileArchivedAt: string | null;
  /** score_type = 'relationship' rows, newest first. */
  relationshipScores: { score: number; recorded_at: string }[];
  tasks: { status: TaskStatus; due_date: string | null; completed_at: string | null }[];
  /** Most recent created_at across this profile's tasks and notes, if any. */
  lastActivityAt: string | null;
  eventLinks: { role: ProfileEventRole }[];
  leadSource: { name: string; qualityScore: number } | null;
  now: Date;
}

export interface CriterionResult {
  value: number;
  explanation: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Shared by both sponsorscore and stadsscore: is the relatiescore going up or down? */
export function calculateRelationshipTrend(ctx: ScoringContext): CriterionResult {
  const [latest, previous] = ctx.relationshipScores;

  if (!latest || !previous) {
    return {
      value: 50,
      explanation:
        "Nog onvoldoende relatiescore-geschiedenis voor een trend (minimaal 2 metingen nodig) — neutrale score toegepast.",
    };
  }

  const delta = round(latest.score - previous.score);
  const value = clamp(50 + delta, 0, 100);
  const direction = delta > 0 ? "steeg" : delta < 0 ? "daalde" : "bleef gelijk";
  const deltaText = delta === 0 ? "" : ` (${delta > 0 ? "+" : ""}${delta})`;

  return {
    value,
    explanation: `Relatiescore ${direction} van ${previous.score} naar ${latest.score}${deltaText} sinds de vorige meting.`,
  };
}

/** Sponsorscore only: percentage of deadline-bound taken afgerond op tijd. */
export function calculateTaskPunctuality(ctx: ScoringContext): CriterionResult {
  const assessable = ctx.tasks.filter((task) => task.due_date !== null);
  const onTime = assessable.filter((task) => {
    if (task.status !== "done" || !task.completed_at) return false;
    const deadline = new Date(`${task.due_date}T23:59:59.999Z`).getTime();
    return new Date(task.completed_at).getTime() <= deadline;
  });
  const overdue = assessable.filter((task) => {
    if (task.status === "done") return !onTime.includes(task);
    const deadline = new Date(`${task.due_date}T23:59:59.999Z`).getTime();
    return ctx.now.getTime() > deadline;
  });
  const considered = onTime.length + overdue.length;

  if (considered === 0) {
    return {
      value: 50,
      explanation: "Nog geen taken met een deadline om te beoordelen — neutrale score toegepast.",
    };
  }

  const pct = round((onTime.length / considered) * 100);
  return {
    value: pct,
    explanation: `${onTime.length} van de ${considered} taken met deadline op tijd afgerond (${pct}%).`,
  };
}

/** Sponsorscore only: hoe lang en hoe continu is het sponsorverleden. */
export function calculateSponsorTenure(ctx: ScoringContext): CriterionResult {
  const start = new Date(ctx.profileCreatedAt);
  const end = ctx.profileArchivedAt ? new Date(ctx.profileArchivedAt) : ctx.now;
  const tenureMonths = Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
  const tenureScore = clamp((tenureMonths / 24) * 100, 0, 100);

  const lastActivity = ctx.lastActivityAt ? new Date(ctx.lastActivityAt) : start;
  const daysSinceActivity = Math.max(
    0,
    Math.round((ctx.now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const recencyScore = daysSinceActivity <= 90 ? 100 : daysSinceActivity <= 180 ? 60 : 20;

  const value = round(tenureScore * 0.7 + recencyScore * 0.3);
  const monthsLabel = tenureMonths === 1 ? "maand" : "maanden";
  const archivedNote = ctx.profileArchivedAt ? " (gearchiveerd)" : "";

  return {
    value,
    explanation: `Actief sinds ${formatDate(ctx.profileCreatedAt)} (${tenureMonths} ${monthsLabel})${archivedNote}, laatste activiteit ${daysSinceActivity} dagen geleden.`,
  };
}

function scoreEventLinks(ctx: ScoringContext): { value: number; sponsorCount: number; leadCount: number } {
  const sponsorCount = ctx.eventLinks.filter((link) => link.role === "sponsor").length;
  const leadCount = ctx.eventLinks.filter((link) => link.role === "lead").length;
  const points = sponsorCount * 2 + leadCount;
  const value = clamp(round((points / 6) * 100), 0, 100);
  return { value, sponsorCount, leadCount };
}

/** Sponsorscore only: aantal actieve evenementkoppelingen en de rol daarin. */
export function calculateEventEngagement(ctx: ScoringContext): CriterionResult {
  const { value, sponsorCount, leadCount } = scoreEventLinks(ctx);

  if (ctx.eventLinks.length === 0) {
    return { value: 0, explanation: "Nog niet gekoppeld aan een evenement." };
  }

  return {
    value,
    explanation: `Gekoppeld aan ${ctx.eventLinks.length} evenement(en) (${sponsorCount}x sponsor, ${leadCount}x lead).`,
  };
}

/** Stadsscore only: bijdrage aan stadsevenementen via evenementkoppelingen. */
export function calculateEventContribution(ctx: ScoringContext): CriterionResult {
  const { value, sponsorCount, leadCount } = scoreEventLinks(ctx);

  if (ctx.eventLinks.length === 0) {
    return { value: 0, explanation: "Nog geen bijdrage aan stadsevenementen." };
  }

  return {
    value,
    explanation: `Draagt bij aan ${ctx.eventLinks.length} evenement(en) (${sponsorCount}x sponsor, ${leadCount}x lead).`,
  };
}

/** Stadsscore only: kwaliteit van de leadafkomst, o.b.v. het configureerbare quality_score op lead_sources. */
export function calculateLeadSourceQuality(ctx: ScoringContext): CriterionResult {
  if (!ctx.leadSource) {
    return {
      value: 50,
      explanation: "Geen leadafkomst geregistreerd — neutrale score toegepast.",
    };
  }

  return {
    value: clamp(ctx.leadSource.qualityScore, 0, 100),
    explanation: `Leadafkomst "${ctx.leadSource.name}" heeft een geconfigureerde kwaliteitsscore van ${ctx.leadSource.qualityScore}.`,
  };
}

/**
 * Registry of every criterion this build knows how to calculate. A
 * score_criteria row whose `key` isn't listed here (e.g. a criterion added
 * later through an as-yet-unbuilt admin screen) is skipped rather than
 * crashing the calculation — see lib/actions/scoring.ts.
 */
export const CRITERION_CALCULATORS: Record<string, (ctx: ScoringContext) => CriterionResult> = {
  relationship_trend: calculateRelationshipTrend,
  task_punctuality: calculateTaskPunctuality,
  sponsor_tenure: calculateSponsorTenure,
  event_engagement: calculateEventEngagement,
  event_contribution: calculateEventContribution,
  lead_source_quality: calculateLeadSourceQuality,
};
