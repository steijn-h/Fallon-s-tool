"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const logSchema = z.object({
  date: z.string().trim().min(1),
  contactType: z.enum(["telefoon", "email", "persoonlijk", "teams", "anders"]),
  summary: z.string().trim().min(1, "Samenvatting is verplicht"),
  content: z.string().trim().nullable().default(null),
});

export interface LogFormState {
  error: string | null;
}

export async function addConversationLog(
  prospectId: string,
  _prevState: LogFormState,
  formData: FormData,
): Promise<LogFormState> {
  const session = await requireSession();

  const parsed = logSchema.safeParse({
    date: formData.get("date"),
    contactType: formData.get("contactType"),
    summary: formData.get("summary"),
    content: formData.get("content") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("conversation_logs").insert({
    prospect_id: prospectId,
    log_date: parsed.data.date,
    contact_type: parsed.data.contactType,
    summary: parsed.data.summary,
    content: parsed.data.content,
    author_id: session.userId,
  });

  if (error) {
    return { error: "Gespreksverslag toevoegen is mislukt." };
  }

  revalidatePath(`/prospects/${prospectId}`);
  return { error: null };
}

export async function deleteConversationLog(prospectId: string, logId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("conversation_logs").delete().eq("id", logId);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath(`/prospects/${prospectId}`);
}
