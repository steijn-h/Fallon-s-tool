"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

export async function addArchetypeAssessment(input: {
  prospectId?: string;
  sponsorshipId?: string;
  archetypeId: ArchetypeId;
  matches: boolean;
  explanation: string | null;
}) {
  const session = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("archetype_assessments").insert({
    prospect_id: input.prospectId ?? null,
    sponsorship_id: input.sponsorshipId ?? null,
    archetype_id: input.archetypeId,
    matches: input.matches,
    explanation: input.explanation,
    author_id: session.userId,
  });

  if (error) throw new Error("Beoordeling opslaan is mislukt.");

  if (input.prospectId) revalidatePath(`/prospects/${input.prospectId}`);
  if (input.sponsorshipId) revalidatePath(`/sponsorschappen/${input.sponsorshipId}`);
}

export async function setSponsorshipArchetype(sponsorshipId: string, archetypeId: ArchetypeId) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sponsorships")
    .update({ archetype_id: archetypeId })
    .eq("id", sponsorshipId);

  if (error) throw new Error("Archetype koppelen is mislukt.");
  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
}
