"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/supabase/database.types";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Titel is verplicht"),
  description: z.string().trim().optional(),
  due_date: z.string().trim().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
});

export interface TaskFormState {
  error: string | null;
}

export async function createTask(
  profileId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const session = await requireSession();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    due_date: formData.get("due_date") ?? undefined,
    assigned_to: formData.get("assigned_to") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    profile_id: profileId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    due_date: parsed.data.due_date || null,
    assigned_to: parsed.data.assigned_to || session.userId,
    created_by: session.userId,
  });

  if (error) {
    return { error: "Taak aanmaken is mislukt." };
  }

  revalidatePath(`/profiles/${profileId}`);
  return { error: null };
}

export async function setTaskStatus(profileId: string, taskId: string, status: TaskStatus) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) {
    throw new Error("Taakstatus bijwerken is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
}
