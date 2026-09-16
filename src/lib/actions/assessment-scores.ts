"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function setAssessmentScore(
  sponsorshipId: string,
  handleId: string,
  score: number,
  note: string | null,
) {
  const session = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("assessment_scores")
    .upsert(
      { sponsorship_id: sponsorshipId, handle_id: handleId, score, note },
      { onConflict: "sponsorship_id,handle_id" },
    );

  if (error) throw new Error("Score opslaan is mislukt.");

  const { data: handle } = await supabase.from("handles").select("name").eq("id", handleId).single();

  await supabase.from("activities").insert({
    sponsorship_id: sponsorshipId,
    type: "assessment",
    title: `Beoordeling bijgewerkt: ${handle?.name ?? handleId}`,
    description: `Score: ${score}/100`,
    author_id: session.userId,
  });

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  revalidatePath(`/beoordeling/${sponsorshipId}`);
  revalidatePath("/beoordeling");
}

export async function removeAssessmentScore(sponsorshipId: string, handleId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_scores")
    .delete()
    .eq("sponsorship_id", sponsorshipId)
    .eq("handle_id", handleId);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  revalidatePath(`/beoordeling/${sponsorshipId}`);
  revalidatePath("/beoordeling");
}
