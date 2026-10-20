"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AccessLevel } from "@/lib/supabase/database.types";

export async function updateMemberAccessLevel(memberId: string, accessLevel: AccessLevel) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_members")
    .update({ access_level: accessLevel })
    .eq("id", memberId);

  if (error) throw new Error("Rechten bijwerken is mislukt.");
  revalidatePath("/instellingen");
}
