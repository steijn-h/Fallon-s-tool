"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { initialsForOwnerName, randomOwnerColor } from "@/lib/owner-defaults";
import { createClient } from "@/lib/supabase/server";

export async function addOwner(name: string) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase.from("owners").insert({
    name: trimmed,
    initials: initialsForOwnerName(trimmed),
    color: randomOwnerColor(),
  });

  if (error) throw new Error("Eigenaar toevoegen is mislukt.");
  revalidatePath("/instellingen");
}

export async function renameOwner(id: string, name: string) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("owners")
    .update({ name: trimmed, initials: initialsForOwnerName(trimmed) })
    .eq("id", id);

  if (error) throw new Error("Eigenaar bijwerken is mislukt.");
  revalidatePath("/instellingen");
}

export async function deleteOwner(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("owners").delete().eq("id", id);

  if (error) throw new Error("Eigenaar verwijderen is mislukt.");
  revalidatePath("/instellingen");
}

/** Links (or unlinks, when userId is null) a dealverantwoordelijke to a
 * real portal account — "mix van beide": most owners are just a name,
 * some are also a real user whose access_level then determines what they
 * may edit. */
export async function linkOwnerToAccount(ownerId: string, userId: string | null) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("owners").update({ user_id: userId }).eq("id", ownerId);

  if (error) throw new Error("Koppelen is mislukt — mogelijk is dit account al aan een andere eigenaar gekoppeld.");
  revalidatePath("/instellingen");
}
