// Beoordelingsscores worden niet meer met de hand ingevoerd: dit bestand
// berekent ze uit de acties die al op een sponsorschap zijn vastgelegd
// (deliverables, betalingen, activiteiten, looptijd). Een handmatige
// afwijking kan alleen via een aanvraag in score_disputes, beoordeeld door
// iemand met access_level 'full' — zie supabase/migrations/20261020000045.
//
// "status" velden als 'overdue' worden in de UI afgeleid (niet in de
// database opgeslagen), dus "te laat" wordt hier zelf berekend uit de
// deadline/betaaldatum in plaats van op die status te vertrouwen.
import type { SupabaseClient } from "@supabase/supabase-js";

import { durationYears } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

export interface ScoringSponsorship {
  start_date: string;
  end_date: string;
}

export interface ScoringDeliverable {
  status: string;
  due_date: string | null;
  completed_at: string | null;
}

export interface ScoringPayment {
  status: string;
  due_date: string;
  paid_at: string | null;
}

export interface ScoringActivity {
  occurred_at: string;
}

export interface SponsorshipSignals {
  deliveryScore: number;
  paymentScore: number;
  engagementScore: number;
  longevityScore: number;
}

const NEUTRAL_SCORE = 70;
const RECENT_ACTIVITY_WINDOW_DAYS = 180;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isDeliverableLate(d: ScoringDeliverable, now: Date): boolean {
  if (!d.due_date) return false;
  if (d.status === "delivered") {
    return !!d.completed_at && d.completed_at > d.due_date;
  }
  return new Date(d.due_date) < now;
}

function isPaymentLate(p: ScoringPayment, now: Date): boolean {
  if (p.status === "paid") {
    return !!p.paid_at && p.paid_at > p.due_date;
  }
  return new Date(p.due_date) < now;
}

export function computeSponsorshipSignals(
  sponsorship: ScoringSponsorship,
  deliverables: ScoringDeliverable[],
  payments: ScoringPayment[],
  activities: ScoringActivity[],
  now: Date = new Date(),
): SponsorshipSignals {
  const judgedDeliverables = deliverables.filter((d) => d.due_date !== null);
  const lateDeliverables = judgedDeliverables.filter((d) => isDeliverableLate(d, now));
  const deliveryScore =
    judgedDeliverables.length > 0
      ? Math.round(((judgedDeliverables.length - lateDeliverables.length) / judgedDeliverables.length) * 100)
      : NEUTRAL_SCORE;

  const latePayments = payments.filter((p) => isPaymentLate(p, now));
  const paymentScore =
    payments.length > 0 ? Math.round(((payments.length - latePayments.length) / payments.length) * 100) : NEUTRAL_SCORE;

  const recentActivityCount = activities.filter(
    (a) => (now.getTime() - new Date(a.occurred_at).getTime()) / MS_PER_DAY <= RECENT_ACTIVITY_WINDOW_DAYS,
  ).length;
  const engagementScore = Math.min(100, recentActivityCount * 15 + 25);

  const years = durationYears(sponsorship.start_date, sponsorship.end_date);
  const longevityScore = Math.max(0, Math.min(100, Math.round((years / 5) * 100)));

  return { deliveryScore, paymentScore, engagementScore, longevityScore };
}

// Vaste handvatten (uit de standaard-seed) krijgen een eigen signaal;
// een aangemaakt/aangepast handvat zonder match valt terug op het
// gemiddelde van alle signalen.
const HANDLE_SIGNAL_MAP: Record<string, keyof SponsorshipSignals> = {
  "h-verbinding": "engagementScore",
  "h-communautair": "engagementScore",
  "h-dmu-bereik": "engagementScore",
  "h-rendement": "paymentScore",
  "h-uitvoerbaarheid": "deliveryScore",
  "h-strategische-fit": "longevityScore",
};

export function computeHandleScore(handleId: string, signals: SponsorshipSignals): number {
  const mapped = HANDLE_SIGNAL_MAP[handleId];
  if (mapped) return signals[mapped];
  return Math.round(
    (signals.deliveryScore + signals.paymentScore + signals.engagementScore + signals.longevityScore) / 4,
  );
}

function signalLabel(signal: keyof SponsorshipSignals): string {
  switch (signal) {
    case "deliveryScore":
      return "het op tijd nakomen van deliverables";
    case "paymentScore":
      return "betaalgedrag (facturen op tijd betaald)";
    case "engagementScore":
      return "recente activiteit en contactfrequentie";
    case "longevityScore":
      return "de looptijd en bewezen verlenging van de samenwerking";
  }
}

export function explainHandleScore(handleId: string, signals: SponsorshipSignals): string {
  const mapped = HANDLE_SIGNAL_MAP[handleId];
  const risks: string[] = [];
  if (signals.deliveryScore < 60) risks.push("deliverables lopen regelmatig uit of staan na de deadline nog open");
  if (signals.paymentScore < 60) risks.push("facturen worden vaak laat of helemaal niet betaald");
  if (signals.engagementScore < 50) risks.push("weinig recente activiteit of contact (laatste 180 dagen)");
  if (signals.longevityScore < 40) risks.push("nog een korte of eenmalige looptijd, geen bewezen verlenging");

  const base = mapped
    ? `Score gebaseerd op ${signalLabel(mapped)}.`
    : "Score is het gemiddelde van uitvoerbaarheid, betaalgedrag, betrokkenheid en looptijd — dit handvat is niet aan één specifiek signaal gekoppeld.";

  if (risks.length === 0) {
    return `${base} Geen directe verbeterpunten of risico's gevonden op basis van de vastgelegde acties.`;
  }
  return `${base} Verbeterpunten/risico's: ${risks.join("; ")}.`;
}

export async function recalculateAssessmentScores(
  supabase: SupabaseClient<Database>,
  sponsorshipId: string,
): Promise<void> {
  const [{ data: sponsorship }, { data: handles }, { data: deliverables }, { data: payments }, { data: activities }] =
    await Promise.all([
      supabase.from("sponsorships").select("start_date, end_date").eq("id", sponsorshipId).single(),
      supabase.from("handles").select("id"),
      supabase.from("deliverables").select("status, due_date, completed_at").eq("sponsorship_id", sponsorshipId),
      supabase.from("payments").select("status, due_date, paid_at").eq("sponsorship_id", sponsorshipId),
      supabase.from("activities").select("occurred_at").eq("sponsorship_id", sponsorshipId),
    ]);

  if (!sponsorship || !handles || handles.length === 0) return;

  const signals = computeSponsorshipSignals(sponsorship, deliverables ?? [], payments ?? [], activities ?? []);

  const rows = handles.map((h) => ({
    sponsorship_id: sponsorshipId,
    handle_id: h.id,
    score: computeHandleScore(h.id, signals),
    explanation: explainHandleScore(h.id, signals),
  }));

  await supabase.from("assessment_scores").upsert(rows, { onConflict: "sponsorship_id,handle_id" });
}
