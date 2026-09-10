"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const noteSchema = z.object({
  body: z.string().trim().min(1, "Notitie mag niet leeg zijn"),
});

export interface NoteFormState {
  error: string | null;
}

export async function addNote(
  profileId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const session = await requireSession();

  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    profile_id: profileId,
    author_id: session.userId,
    body: parsed.data.body,
  });

  if (error) {
    return { error: "Notitie toevoegen is mislukt." };
  }

  revalidatePath(`/profiles/${profileId}`);
  return { error: null };
}
