"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const targetsSchema = z.object({
  sponsorCount: z.coerce.number().min(0),
  sponsorAmount: z.coerce.number().min(0),
  renewalRate: z.coerce.number().min(0).max(100),
});

export interface TargetsFormState {
  error: string | null;
}

export async function updateYearTargets(
  _prevState: TargetsFormState,
  formData: FormData,
): Promise<TargetsFormState> {
  await requireSession();

  const parsed = targetsSchema.safeParse({
    sponsorCount: formData.get("sponsorCount"),
    sponsorAmount: formData.get("sponsorAmount"),
    renewalRate: formData.get("renewalRate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  // No .eq() filter needed: RLS already scopes this to exactly the caller's
  // own organization's single row (year_targets' primary key IS
  // organization_id).
  const { error } = await supabase.from("year_targets").update({
    sponsor_count: parsed.data.sponsorCount,
    sponsor_amount: parsed.data.sponsorAmount,
    renewal_rate: parsed.data.renewalRate,
  });

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  revalidatePath("/instellingen");
  revalidatePath("/");
  return { error: null };
}
