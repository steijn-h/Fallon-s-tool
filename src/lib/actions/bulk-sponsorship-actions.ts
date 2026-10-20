"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { recalculateAssessmentScores } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/lib/types";

const bulkActivitySchema = z.object({
  sponsorshipIds: z.array(z.string()).min(1, "Selecteer minstens één sponsor"),
  type: z.enum(["call", "email", "meeting", "note", "contract", "payment", "assessment"]),
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().nullable().default(null),
});

export interface BulkActionState {
  error: string | null;
  successCount: number | null;
}

export async function bulkAddActivity(
  sponsorshipIds: string[],
  type: ActivityType,
  title: string,
  description: string | null,
): Promise<BulkActionState> {
  const session = await requireSession();

  const parsed = bulkActivitySchema.safeParse({ sponsorshipIds, type, title, description });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer.", successCount: null };
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("activities")
    .insert(
      parsed.data.sponsorshipIds.map((sponsorshipId) => ({
        sponsorship_id: sponsorshipId,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description,
        author_id: session.userId,
      })),
      { count: "exact" },
    );

  if (error) {
    return { error: "Activiteit toevoegen is mislukt.", successCount: null };
  }

  if (parsed.data.type !== "assessment") {
    await Promise.all(parsed.data.sponsorshipIds.map((id) => recalculateAssessmentScores(supabase, id)));
  }

  revalidatePath("/sponsorschappen");
  return { error: null, successCount: count ?? parsed.data.sponsorshipIds.length };
}

const bulkDeliverableSchema = z.object({
  sponsorshipIds: z.array(z.string()).min(1, "Selecteer minstens één sponsor"),
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().nullable().default(null),
  dueDate: z.string().trim().nullable().default(null),
});

export async function bulkAddReciprocalPerformance(
  sponsorshipIds: string[],
  title: string,
  description: string | null,
  dueDate: string | null,
): Promise<BulkActionState> {
  await requireSession();

  const parsed = bulkDeliverableSchema.safeParse({ sponsorshipIds, title, description, dueDate });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer.", successCount: null };
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("deliverables")
    .insert(
      parsed.data.sponsorshipIds.map((sponsorshipId) => ({
        sponsorship_id: sponsorshipId,
        title: parsed.data.title,
        description: parsed.data.description,
        due_date: parsed.data.dueDate,
      })),
      { count: "exact" },
    );

  if (error) {
    return { error: "Wederkerige prestatie toevoegen is mislukt.", successCount: null };
  }

  await Promise.all(parsed.data.sponsorshipIds.map((id) => recalculateAssessmentScores(supabase, id)));

  revalidatePath("/sponsorschappen");
  return { error: null, successCount: count ?? parsed.data.sponsorshipIds.length };
}
