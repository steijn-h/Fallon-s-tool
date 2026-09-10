"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/lib/supabase/database.types";

const profileSchema = z.object({
  organization_name: z.string().trim().min(1, "Naam is verplicht"),
  contact_name: z.string().trim().optional(),
  street: z.string().trim().optional(),
  house_number: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
  city: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  status: z.enum(["lead", "prospect", "sponsor", "inactive"]),
  archetype_id: z.string().uuid().optional().or(z.literal("")),
});

function readCustomFields(formData: FormData, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(`custom_${key}`);
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value.trim();
    }
  }
  return result;
}

export interface ProfileFormState {
  error: string | null;
}

export async function createProfile(
  customFieldKeys: string[],
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireSession();

  const parsed = profileSchema.safeParse({
    organization_name: formData.get("organization_name"),
    contact_name: formData.get("contact_name") ?? undefined,
    street: formData.get("street") ?? undefined,
    house_number: formData.get("house_number") ?? undefined,
    postal_code: formData.get("postal_code") ?? undefined,
    city: formData.get("city") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    email: formData.get("email") ?? undefined,
    status: formData.get("status") ?? "lead",
    archetype_id: formData.get("archetype_id") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      organization_id: session.organizationId,
      created_by: session.userId,
      organization_name: parsed.data.organization_name,
      contact_name: parsed.data.contact_name || null,
      street: parsed.data.street || null,
      house_number: parsed.data.house_number || null,
      postal_code: parsed.data.postal_code || null,
      city: parsed.data.city || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      status: parsed.data.status,
      archetype_id: parsed.data.archetype_id || null,
      custom_fields: readCustomFields(formData, customFieldKeys),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Aanmaken van profiel is mislukt." };
  }

  revalidatePath("/profiles");
  redirect(`/profiles/${data.id}`);
}

export async function updateProfile(
  profileId: string,
  customFieldKeys: string[],
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireSession();

  const parsed = profileSchema.safeParse({
    organization_name: formData.get("organization_name"),
    contact_name: formData.get("contact_name") ?? undefined,
    street: formData.get("street") ?? undefined,
    house_number: formData.get("house_number") ?? undefined,
    postal_code: formData.get("postal_code") ?? undefined,
    city: formData.get("city") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    email: formData.get("email") ?? undefined,
    status: formData.get("status") ?? "lead",
    archetype_id: formData.get("archetype_id") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      organization_name: parsed.data.organization_name,
      contact_name: parsed.data.contact_name || null,
      street: parsed.data.street || null,
      house_number: parsed.data.house_number || null,
      postal_code: parsed.data.postal_code || null,
      city: parsed.data.city || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      status: parsed.data.status,
      archetype_id: parsed.data.archetype_id || null,
      custom_fields: readCustomFields(formData, customFieldKeys),
    })
    .eq("id", profileId);

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
  return { error: null };
}

export async function setProfileStatus(profileId: string, status: ProfileStatus) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", profileId);

  if (error) {
    throw new Error("Status bijwerken is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
}

export async function archiveProfile(profileId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) {
    throw new Error("Archiveren is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
}

export async function unarchiveProfile(profileId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ archived_at: null })
    .eq("id", profileId);

  if (error) {
    throw new Error("Herstellen uit archief is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
}

export async function setProfileLeadSource(
  profileId: string,
  leadSourceId: string,
  note: string,
) {
  const session = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("profile_lead_source").upsert(
    {
      organization_id: session.organizationId,
      profile_id: profileId,
      lead_source_id: leadSourceId,
      note: note || null,
      recorded_by: session.userId,
    },
    { onConflict: "profile_id" },
  );

  if (error) {
    throw new Error("Leadafkomst vastleggen is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
}

export async function createLeadSource(name: string) {
  const session = await requireSession();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Naam is verplicht.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_sources")
    .insert({ organization_id: session.organizationId, name: trimmed })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Leadafkomst aanmaken is mislukt.");
  }

  revalidatePath("/profiles");
  return data.id;
}
