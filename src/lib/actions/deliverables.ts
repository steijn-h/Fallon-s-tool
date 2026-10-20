"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { recalculateAssessmentScores } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";
import type { DeliverableStatus } from "@/lib/types";

const deliverableSchema = z.object({
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().nullable().default(null),
  dueDate: z.string().trim().nullable().default(null),
  value: z.coerce.number().nullable().default(null),
});

export interface DeliverableFormState {
  error: string | null;
}

export async function addDeliverable(
  sponsorshipId: string,
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  await requireSession();

  const parsed = deliverableSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    dueDate: formData.get("dueDate") || null,
    value: formData.get("value") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").insert({
    sponsorship_id: sponsorshipId,
    title: parsed.data.title,
    description: parsed.data.description,
    due_date: parsed.data.dueDate,
    value: parsed.data.value,
  });

  if (error) {
    return { error: "Deliverable toevoegen is mislukt." };
  }

  await recalculateAssessmentScores(supabase, sponsorshipId);

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  return { error: null };
}

export async function updateDeliverableStatus(
  sponsorshipId: string,
  deliverableId: string,
  status: DeliverableStatus,
) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliverables")
    .update({ status, completed_at: status === "delivered" ? new Date().toISOString() : null })
    .eq("id", deliverableId);

  if (error) throw new Error("Bijwerken is mislukt.");

  await recalculateAssessmentScores(supabase, sponsorshipId);

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
}
