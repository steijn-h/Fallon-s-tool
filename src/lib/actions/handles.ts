"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const handleSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht"),
  category: z.enum(["archetype", "individual", "both"]),
  description: z.string().trim().nullable().default(null),
  weight: z.coerce.number().min(1).max(5),
});

export interface HandleFormState {
  error: string | null;
}

function slugify(name: string): string {
  return (
    "h-" +
    (name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || Date.now().toString(36))
  );
}

export async function addHandle(
  _prevState: HandleFormState,
  formData: FormData,
): Promise<HandleFormState> {
  await requireSession();

  const parsed = handleSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description") || null,
    weight: formData.get("weight"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("handles").insert({
    id: slugify(parsed.data.name),
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
    weight: parsed.data.weight,
  });

  if (error) {
    return { error: "Handvat toevoegen is mislukt (bestaat de naam al?)." };
  }

  revalidatePath("/handvatten");
  return { error: null };
}

export async function updateHandle(
  id: string,
  patch: { name?: string; category?: "archetype" | "individual" | "both"; description?: string | null; weight?: number },
) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("handles").update(patch).eq("id", id);

  if (error) throw new Error("Bijwerken is mislukt.");
  revalidatePath("/handvatten");
}

export async function deleteHandle(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("handles").delete().eq("id", id);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/handvatten");
}
