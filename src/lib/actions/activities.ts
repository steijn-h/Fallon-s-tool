"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "contract", "payment", "assessment"]),
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().nullable().default(null),
});

export interface ActivityFormState {
  error: string | null;
}

export async function addActivity(
  sponsorshipId: string,
  _prevState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const session = await requireSession();

  const parsed = activitySchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    sponsorship_id: sponsorshipId,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    author_id: session.userId,
  });

  if (error) {
    return { error: "Activiteit toevoegen is mislukt." };
  }

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  return { error: null };
}
