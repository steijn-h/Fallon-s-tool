"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function addEvent(name: string) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ name: trimmed });
  if (error) throw new Error("Evenement toevoegen is mislukt.");
  revalidatePath("/instellingen");
}

export async function renameEvent(id: string, name: string) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase.from("events").update({ name: trimmed }).eq("id", id);
  if (error) throw new Error("Evenement bijwerken is mislukt.");
  revalidatePath("/instellingen");
}

export async function deleteEvent(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    throw new Error(
      "Evenement verwijderen is mislukt — waarschijnlijk hangen er nog sponsorschappen onder een pakket van dit evenement.",
    );
  }
  revalidatePath("/instellingen");
}

export async function addEventPackage(eventId: string, name: string, value: number) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("event_packages")
    .select("sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("event_packages").insert({
    event_id: eventId,
    name: trimmed,
    value,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });
  if (error) throw new Error("Pakket toevoegen is mislukt.");
  revalidatePath("/instellingen");
}

export async function renameEventPackage(id: string, name: string, value: number) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_packages")
    .update({ name: trimmed, value })
    .eq("id", id);
  if (error) throw new Error("Pakket bijwerken is mislukt.");
  revalidatePath("/instellingen");
}

export async function deleteEventPackage(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("event_packages").delete().eq("id", id);
  if (error) {
    throw new Error(
      "Pakket verwijderen is mislukt — waarschijnlijk hangen er nog sponsorschappen onder dit pakket.",
    );
  }
  revalidatePath("/instellingen");
}
