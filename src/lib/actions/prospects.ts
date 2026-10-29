"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ArchetypeId, LeadWarmth, OrganizationSize } from "@/lib/types";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().nullable().default(null),
  email: z.string().trim().nullable().default(null),
  phone: z.string().trim().nullable().default(null),
});

const phoneNumberSchema = z.object({
  name: z.string().trim().min(1),
  number: z.string().trim().min(1),
});

const prospectSchema = z.object({
  company: z.string().trim().min(1, "Bedrijfsnaam is verplicht"),
  industry: z.string().trim().min(1, "Branche is verplicht"),
  website: z.string().trim().nullable().default(null),
  city: z.string().trim().nullable().default(null),
  companyType: z.string().trim().nullable().default(null),
  dmuName: z.string().trim().nullable().default(null),
  dmuPhone: z.string().trim().nullable().default(null),
  leadWarmth: z.enum(["koud", "lauw", "warm", "heet"]),
  organizationSize: z.enum(["1-10", "11-50", "50-250", "250-1000", "1000+"]).nullable().default(null),
  estValue: z.coerce.number().min(0),
  probability: z.coerce.number().min(0).max(100),
  source: z.string().trim().nullable().default(null),
  notes: z.string().trim().nullable().default(null),
  nextStep: z.string().trim().nullable().default(null),
  nextStepDue: z.string().trim().nullable().default(null),
  ownerId: z.string().trim().nullable().default(null),
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
  stageId: z.string().trim().min(1),
  contacts: z.array(contactSchema).default([]),
  phoneNumbers: z.array(phoneNumberSchema).default([]),
});

export type ProspectInput = z.input<typeof prospectSchema>;

async function saveContactsAndPhones(
  supabase: Awaited<ReturnType<typeof createClient>>,
  prospectId: string,
  contacts: z.infer<typeof contactSchema>[],
  phoneNumbers: z.infer<typeof phoneNumberSchema>[],
) {
  await supabase.from("prospect_contacts").delete().eq("prospect_id", prospectId);
  await supabase.from("prospect_phone_numbers").delete().eq("prospect_id", prospectId);

  if (contacts.length > 0) {
    await supabase
      .from("prospect_contacts")
      .insert(contacts.map((c) => ({ ...c, prospect_id: prospectId })));
  }
  if (phoneNumbers.length > 0) {
    await supabase
      .from("prospect_phone_numbers")
      .insert(phoneNumbers.map((p) => ({ ...p, prospect_id: prospectId })));
  }
}

export async function createProspect(input: ProspectInput) {
  await requireSession();
  const parsed = prospectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { contacts, phoneNumbers, ...prospect } = parsed.data;

  const { data, error } = await supabase
    .from("prospects")
    .insert({
      company: prospect.company,
      industry: prospect.industry,
      website: prospect.website,
      city: prospect.city,
      company_type: prospect.companyType,
      dmu_name: prospect.dmuName,
      dmu_phone: prospect.dmuPhone,
      lead_warmth: prospect.leadWarmth as LeadWarmth,
      organization_size: prospect.organizationSize as OrganizationSize | null,
      est_value: prospect.estValue,
      probability: prospect.probability,
      source: prospect.source,
      notes: prospect.notes,
      next_step: prospect.nextStep,
      next_step_due: prospect.nextStepDue,
      owner_id: prospect.ownerId,
      archetype_id: prospect.archetypeId as ArchetypeId | null,
      stage_id: prospect.stageId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Aanmaken van prospect is mislukt." };
  }

  await saveContactsAndPhones(supabase, data.id, contacts, phoneNumbers);

  revalidatePath("/acquisitie");
  redirect(`/prospects/${data.id}`);
}

export async function updateProspect(id: string, input: ProspectInput) {
  await requireSession();
  const parsed = prospectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { contacts, phoneNumbers, ...prospect } = parsed.data;

  const { error } = await supabase
    .from("prospects")
    .update({
      company: prospect.company,
      industry: prospect.industry,
      website: prospect.website,
      city: prospect.city,
      company_type: prospect.companyType,
      dmu_name: prospect.dmuName,
      dmu_phone: prospect.dmuPhone,
      lead_warmth: prospect.leadWarmth as LeadWarmth,
      organization_size: prospect.organizationSize as OrganizationSize | null,
      est_value: prospect.estValue,
      probability: prospect.probability,
      source: prospect.source,
      notes: prospect.notes,
      next_step: prospect.nextStep,
      next_step_due: prospect.nextStepDue,
      owner_id: prospect.ownerId,
      archetype_id: prospect.archetypeId as ArchetypeId | null,
      stage_id: prospect.stageId,
    })
    .eq("id", id);

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  await saveContactsAndPhones(supabase, id, contacts, phoneNumbers);

  revalidatePath(`/prospects/${id}`);
  revalidatePath("/acquisitie");
  return { error: null };
}

export async function moveProspectStage(id: string, stageId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("prospects").update({ stage_id: stageId }).eq("id", id);

  if (error) throw new Error("Verplaatsen is mislukt.");
  revalidatePath("/acquisitie");
}

export async function deleteProspect(id: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase.from("prospects").delete().eq("id", id);

  if (error) throw new Error("Verwijderen is mislukt.");
  revalidatePath("/acquisitie");
  redirect("/acquisitie");
}

export async function convertProspectToSponsorship(
  prospectId: string,
  input: { eventPackageId: string; value: number; startDate: string; endDate: string },
) {
  await requireSession();
  const supabase = await createClient();

  const { data: prospect, error: prospectError } = await supabase
    .from("prospects")
    .select("company, industry, website, archetype_id, owner_id")
    .eq("id", prospectId)
    .single();

  if (prospectError || !prospect) {
    return { error: "Prospect niet gevonden." };
  }

  const { data: sponsorship, error: sponsorshipError } = await supabase
    .from("sponsorships")
    .insert({
      prospect_id: prospectId,
      company: prospect.company,
      industry: prospect.industry,
      website: prospect.website,
      logo_color: "0 72% 51%",
      event_package_id: input.eventPackageId,
      value: input.value,
      start_date: input.startDate,
      end_date: input.endDate,
      owner_id: prospect.owner_id,
      archetype_id: prospect.archetype_id,
    })
    .select("id")
    .single();

  if (sponsorshipError || !sponsorship) {
    return { error: "Aanmaken van sponsorschap is mislukt." };
  }

  await supabase.from("activities").insert({
    sponsorship_id: sponsorship.id,
    type: "contract",
    title: "Sponsorschap aangemaakt",
    description: "Geconverteerd vanuit prospect.",
  });

  const { data: wonStage } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("type", "won")
    .limit(1)
    .maybeSingle();

  if (wonStage) {
    await supabase.from("prospects").update({ stage_id: wonStage.id }).eq("id", prospectId);
  }

  revalidatePath("/acquisitie");
  revalidatePath("/sponsorschappen");
  redirect(`/sponsorschappen/${sponsorship.id}`);
}
