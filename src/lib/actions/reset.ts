"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_YEAR_TARGETS } from "@/lib/types";

/**
 * Deletes all prospects and sponsorships (and everything that hangs off
 * them via ON DELETE CASCADE — contacts, tasks, conversation logs,
 * deliverables, activities, payments, assessment scores), and resets the
 * year targets. Deliberately leaves owners, pipeline stages and handles
 * alone: those are staff-configured setup, not business records, so a
 * "reset the data" action shouldn't quietly undo configuration choices too.
 */
export async function resetAllData() {
  await requireSession();
  const supabase = await createClient();

  const { error: sponsorshipsError } = await supabase
    .from("sponsorships")
    .delete()
    .not("id", "is", null);
  if (sponsorshipsError) throw new Error("Resetten is mislukt (sponsorschappen).");

  const { error: prospectsError } = await supabase.from("prospects").delete().not("id", "is", null);
  if (prospectsError) throw new Error("Resetten is mislukt (prospects).");

  const { error: targetsError } = await supabase.from("year_targets").update({
    sponsor_count: DEFAULT_YEAR_TARGETS.sponsorCount,
    sponsor_amount: DEFAULT_YEAR_TARGETS.sponsorAmount,
    renewal_rate: DEFAULT_YEAR_TARGETS.renewalRate,
  });
  if (targetsError) throw new Error("Resetten is mislukt (jaartargets).");

  revalidatePath("/", "layout");
}
