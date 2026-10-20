"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId } from "@/lib/types";

export async function updateArchetypeSettings(
  archetypeId: ArchetypeId,
  input: { imageUrl: string | null; notes: string | null },
) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("archetype_settings")
    .upsert(
      { archetype_id: archetypeId, image_url: input.imageUrl, notes: input.notes },
      { onConflict: "organization_id,archetype_id" },
    );

  if (error) throw new Error("Opslaan is mislukt.");
  revalidatePath("/archetypes");
}
