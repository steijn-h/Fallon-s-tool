"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().nullable().default(null),
  dueDate: z.string().trim().nullable().default(null),
  priority: z.enum(["laag", "normaal", "hoog"]),
});

export interface TaskFormState {
  error: string | null;
}

export async function addTask(
  prospectId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requireSession();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    dueDate: formData.get("dueDate") || null,
    priority: formData.get("priority") || "normaal",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    prospect_id: prospectId,
    title: parsed.data.title,
    description: parsed.data.description,
    due_date: parsed.data.dueDate,
    priority: parsed.data.priority,
  });

  if (error) {
    return { error: "Taak aanmaken is mislukt." };
  }

  revalidatePath(`/prospects/${prospectId}`);
  return { error: null };
}

export async function toggleTask(prospectId: string, taskId: string, completed: boolean) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);

  if (error) throw new Error("Bijwerken is mislukt.");
  revalidatePath(`/prospects/${prospectId}`);
}

export async function deleteTask(prospectId: string, taskId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath(`/prospects/${prospectId}`);
}
