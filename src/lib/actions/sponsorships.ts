"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type ArchetypeId, type ReturnType, type SponsorshipStatus } from "@/lib/types";

const sponsorshipSchema = z.object({
  company: z.string().trim().min(1, "Bedrijfsnaam is verplicht"),
  industry: z.string().trim().min(1, "Branche is verplicht"),
  website: z.string().trim().nullable().default(null),
  eventPackageId: z.string().trim().min(1, "Pakket is verplicht"),
  value: z.coerce.number().min(0),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
  ownerId: z.string().trim().nullable().default(null),
  notes: z.string().trim().nullable().default(null),
  archetypeId: z
    .enum([
      "calculerende-rationalist",
      "lokale-held",
      "netwerker-relatiebeheerder",
      "stadstrots-aanjager",
      "talentenjager",
      "vinkjes-zetter",
    ])
    .nullable()
    .default(null),
  returnFocus: z.enum(["ROI", "ROO", "ROE", "ROA", "ROCI", "ROKI", "ROK"]).nullable().default(null),
});

export type SponsorshipInput = z.input<typeof sponsorshipSchema>;

export async function createSponsorship(input: SponsorshipInput) {
  await requireSession();
  const parsed = sponsorshipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsorships")
    .insert({
      company: parsed.data.company,
      industry: parsed.data.industry,
      website: parsed.data.website,
      logo_color: "0 72% 51%",
      event_package_id: parsed.data.eventPackageId,
      value: parsed.data.value,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      owner_id: parsed.data.ownerId,
      notes: parsed.data.notes,
      archetype_id: parsed.data.archetypeId as ArchetypeId | null,
      return_focus: parsed.data.returnFocus as ReturnType | null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Aanmaken van sponsorschap is mislukt." };
  }

  await supabase.from("activities").insert({
    sponsorship_id: data.id,
    type: "note",
    title: "Sponsorschap aangemaakt",
  });

  revalidatePath("/sponsorschappen");
  redirect(`/sponsorschappen/${data.id}`);
}

export async function updateSponsorship(id: string, input: SponsorshipInput) {
  await requireSession();
  const parsed = sponsorshipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sponsorships")
    .update({
      company: parsed.data.company,
      industry: parsed.data.industry,
      website: parsed.data.website,
      event_package_id: parsed.data.eventPackageId,
      value: parsed.data.value,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      owner_id: parsed.data.ownerId,
      notes: parsed.data.notes,
      archetype_id: parsed.data.archetypeId as ArchetypeId | null,
      return_focus: parsed.data.returnFocus as ReturnType | null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  revalidatePath(`/sponsorschappen/${id}`);
  revalidatePath("/sponsorschappen");
  return { error: null };
}

export async function setSponsorshipStatus(id: string, status: SponsorshipStatus) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("sponsorships").update({ status }).eq("id", id);
  if (error) throw new Error("Status bijwerken is mislukt.");

  await supabase.from("activities").insert({
    sponsorship_id: id,
    type: "note",
    title: `Status gewijzigd naar ${STATUS_META[status].label}`,
  });

  revalidatePath(`/sponsorschappen/${id}`);
  revalidatePath("/sponsorschappen");
}

export async function deleteSponsorship(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("sponsorships").delete().eq("id", id);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/sponsorschappen");
  redirect("/sponsorschappen");
}

export async function renewSponsorship(
  id: string,
  input: { startDate: string; endDate: string; value: number },
) {
  await requireSession();
  const supabase = await createClient();

  const { data: original, error: originalError } = await supabase
    .from("sponsorships")
    .select("prospect_id, company, industry, website, logo_color, event_package_id, owner_id, archetype_id, return_focus")
    .eq("id", id)
    .single();

  if (originalError || !original) {
    return { error: "Origineel sponsorschap niet gevonden." };
  }

  const { data: renewed, error: renewedError } = await supabase
    .from("sponsorships")
    .insert({
      prospect_id: original.prospect_id,
      renewed_from_id: id,
      company: original.company,
      industry: original.industry,
      website: original.website,
      logo_color: original.logo_color,
      event_package_id: original.event_package_id,
      status: "contracted",
      value: input.value,
      start_date: input.startDate,
      end_date: input.endDate,
      owner_id: original.owner_id,
      archetype_id: original.archetype_id,
      return_focus: original.return_focus,
    })
    .select("id")
    .single();

  if (renewedError || !renewed) {
    return { error: "Verlenging aanmaken is mislukt." };
  }

  await supabase.from("activities").insert({
    sponsorship_id: renewed.id,
    type: "contract",
    title: "Verlenging van eerder sponsorschap",
  });

  revalidatePath("/sponsorschappen");
  redirect(`/sponsorschappen/${renewed.id}`);
}
