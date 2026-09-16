"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PipelineStageType } from "@/lib/types";

function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "fase"
  );
}

export async function addPipelineStage(label: string, type: PipelineStageType) {
  await requireSession();
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("pipeline_stages")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("pipeline_stages").insert({
    id: `${slugify(trimmed)}-${Date.now().toString(36)}`,
    label: trimmed,
    type,
    color: type === "won" ? "152 56% 42%" : type === "lost" ? "0 72% 51%" : "271 50% 55%",
    sort_order: (existing?.sort_order ?? 0) + 1,
  });

  if (error) throw new Error("Fase toevoegen is mislukt.");
  revalidatePath("/instellingen");
  revalidatePath("/acquisitie");
}

export async function updatePipelineStage(id: string, patch: { label?: string; color?: string }) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("pipeline_stages").update(patch).eq("id", id);

  if (error) throw new Error("Fase bijwerken is mislukt.");
  revalidatePath("/instellingen");
  revalidatePath("/acquisitie");
}

export async function deletePipelineStage(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("pipeline_stages").delete().eq("id", id);

  if (error) {
    throw new Error(
      "Fase verwijderen is mislukt (waarschijnlijk staan er nog prospects in deze fase).",
    );
  }
  revalidatePath("/instellingen");
  revalidatePath("/acquisitie");
}

export async function reorderPipelineStages(orderedIds: string[]) {
  await requireSession();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("pipeline_stages").update({ sort_order: index }).eq("id", id),
    ),
  );

  revalidatePath("/instellingen");
  revalidatePath("/acquisitie");
}
