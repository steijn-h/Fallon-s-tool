"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const scoreSchema = z.object({
  score: z.coerce.number().min(0, "Score moet 0 of hoger zijn").max(100, "Score moet 100 of lager zijn"),
  note: z.string().trim().optional(),
});

export interface ScoreFormState {
  error: string | null;
}

export async function addRelationshipScore(
  profileId: string,
  _prevState: ScoreFormState,
  formData: FormData,
): Promise<ScoreFormState> {
  const session = await requireSession();

  const parsed = scoreSchema.safeParse({
    score: formData.get("score"),
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("relationship_scores").insert({
    profile_id: profileId,
    score_type: "relationship",
    score: parsed.data.score,
    note: parsed.data.note || null,
    recorded_by: session.userId,
  });

  if (error) {
    return { error: "Score vastleggen is mislukt." };
  }

  revalidatePath(`/profiles/${profileId}`);
  return { error: null };
}
