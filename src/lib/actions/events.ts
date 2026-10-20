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
  revalidatePath("/evenementen");
}

export async function renameEvent(id: string, name: string) {
  await requireSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Naam is verplicht.");

  const supabase = await createClient();
  const { error } = await supabase.from("events").update({ name: trimmed }).eq("id", id);
  if (error) throw new Error("Evenement bijwerken is mislukt.");
  revalidatePath("/instellingen");
  revalidatePath("/evenementen");
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
  revalidatePath("/evenementen");
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
  revalidatePath("/evenementen");
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
  revalidatePath("/evenementen");
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
  revalidatePath("/evenementen");
}

export async function setEventPackagePriceForYear(
  packageId: string,
  year: number,
  value: number,
  costPrice: number,
) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_package_prices")
    .upsert(
      { event_package_id: packageId, year, value, cost_price: costPrice },
      { onConflict: "event_package_id,year" },
    );
  if (error) throw new Error("Prijs opslaan is mislukt.");

  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    await supabase.from("event_packages").update({ value }).eq("id", packageId);
  }

  revalidatePath("/evenementen");
}

export async function deleteEventPackagePrice(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("event_package_prices").delete().eq("id", id);
  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/evenementen");
}

export async function addReciprocalPerformance(
  packageId: string,
  title: string,
  description: string | null,
  perceivedValue: number | null,
) {
  await requireSession();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Titel is verplicht.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reciprocal_performances")
    .select("sort_order")
    .eq("event_package_id", packageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("reciprocal_performances").insert({
    event_package_id: packageId,
    title: trimmed,
    description,
    perceived_value: perceivedValue,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });
  if (error) throw new Error("Toevoegen is mislukt.");
  revalidatePath("/evenementen");
}

export async function deleteReciprocalPerformance(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("reciprocal_performances").delete().eq("id", id);
  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/evenementen");
}

export async function addReciprocalPerformanceAction(performanceId: string, title: string) {
  await requireSession();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Titel is verplicht.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reciprocal_performance_actions")
    .select("sort_order")
    .eq("reciprocal_performance_id", performanceId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("reciprocal_performance_actions").insert({
    reciprocal_performance_id: performanceId,
    title: trimmed,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });
  if (error) throw new Error("Toevoegen is mislukt.");
  revalidatePath("/evenementen");
}

export async function deleteReciprocalPerformanceAction(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("reciprocal_performance_actions").delete().eq("id", id);
  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/evenementen");
}
