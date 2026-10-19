"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const financialEntrySchema = z.object({
  eventId: z.string().trim().min(1, "Evenement is verplicht"),
  deliverableId: z.string().trim().nullable().default(null),
  type: z.enum(["income", "expense"]),
  category: z.enum(["direct", "indirect", "goodwill"]),
  description: z.string().trim().min(1, "Omschrijving is verplicht"),
  amount: z.coerce.number().min(0),
  entryDate: z.string().trim().min(1),
});

export type FinancialEntryInput = z.input<typeof financialEntrySchema>;

export interface ActionResult {
  error: string | null;
}

export async function addFinancialEntry(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = financialEntrySchema.safeParse({
    eventId: formData.get("eventId"),
    deliverableId: (formData.get("deliverableId") as string) || null,
    type: formData.get("type"),
    category: formData.get("category"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    entryDate: formData.get("entryDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("financial_entries").insert({
    event_id: parsed.data.eventId,
    deliverable_id: parsed.data.deliverableId,
    type: parsed.data.type,
    category: parsed.data.category,
    description: parsed.data.description,
    amount: parsed.data.amount,
    entry_date: parsed.data.entryDate,
  });

  if (error) {
    return { error: "Toevoegen is mislukt." };
  }

  revalidatePath("/financieel");
  return { error: null };
}

export async function deleteFinancialEntry(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("financial_entries").delete().eq("id", id);
  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/financieel");
}
