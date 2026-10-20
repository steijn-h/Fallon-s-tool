"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const disputeSchema = z.object({
  requestedScore: z.coerce.number().min(0).max(100),
  reason: z.string().trim().min(1, "Motivatie is verplicht"),
});

export async function fileScoreDispute(
  sponsorshipId: string,
  handleId: string,
  currentScore: number,
  requestedScore: number,
  reason: string,
) {
  const session = await requireSession();

  const parsed = disputeSchema.safeParse({ requestedScore, reason });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("score_disputes").insert({
    sponsorship_id: sponsorshipId,
    handle_id: handleId,
    current_score: currentScore,
    requested_score: parsed.data.requestedScore,
    reason: parsed.data.reason,
    requested_by: session.userId,
  });

  if (error) throw new Error("Aanvraag indienen is mislukt.");

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  revalidatePath(`/beoordeling/${sponsorshipId}`);
}

export async function reviewScoreDispute(disputeId: string, approve: boolean, feedback: string | null) {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: dispute } = await supabase
    .from("score_disputes")
    .select("sponsorship_id, handle_id, requested_score")
    .eq("id", disputeId)
    .single();

  if (!dispute) throw new Error("Aanvraag niet gevonden.");

  const { data: updated, error } = await supabase
    .from("score_disputes")
    .update({
      status: approve ? "approved" : "rejected",
      reviewed_by: session.userId,
      review_feedback: feedback,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .eq("status", "pending")
    .select("id")
    .single();

  if (error || !updated) {
    throw new Error("Beoordelen is mislukt — mogelijk heb je geen rechten om aanvragen te beoordelen.");
  }

  if (approve) {
    await supabase
      .from("assessment_scores")
      .update({
        score: dispute.requested_score,
        explanation: `Handmatig aangepast na goedgekeurde aanvraag${feedback ? `: ${feedback}` : "."} Bij de volgende vastgelegde actie wordt de score opnieuw automatisch berekend.`,
      })
      .eq("sponsorship_id", dispute.sponsorship_id)
      .eq("handle_id", dispute.handle_id);
  }

  revalidatePath(`/sponsorschappen/${dispute.sponsorship_id}`);
  revalidatePath(`/beoordeling/${dispute.sponsorship_id}`);
  revalidatePath("/beoordeling");
}
