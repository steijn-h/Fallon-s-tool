"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationRole, PackageType } from "@/lib/supabase/database.types";

export interface ActionResult {
  error: string | null;
}

const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht."),
  packageType: z.enum(["a", "b", "c"]),
});

export async function createOrganization(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
    packageType: formData.get("packageType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.name, package_type: parsed.data.packageType });

  if (error) {
    return { error: "Aanmaken is mislukt." };
  }

  revalidatePath("/beheer");
  return { error: null };
}

export async function updateOrganization(
  organizationId: string,
  input: { name: string; packageType: PackageType },
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name: input.name, package_type: input.packageType })
    .eq("id", organizationId);

  if (error) {
    return { error: "Opslaan is mislukt." };
  }

  revalidatePath("/beheer");
  revalidatePath(`/beheer/${organizationId}`);
  return { error: null };
}

export async function deleteOrganization(organizationId: string): Promise<ActionResult> {
  await requirePlatformAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").delete().eq("id", organizationId);

  if (error) {
    return { error: "Verwijderen is mislukt." };
  }

  revalidatePath("/beheer");
  return { error: null };
}

const addMemberSchema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  role: z.enum(["owner", "admin", "member"]),
});

export async function addOrganizationMember(
  organizationId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const parsed = addMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { data: userId, error: lookupError } = await supabase.rpc("lookup_user_id_by_email", {
    lookup_email: parsed.data.email,
  });

  if (lookupError || !userId) {
    return {
      error:
        "Geen account gevonden met dit e-mailadres. Maak het account eerst aan via de Supabase-dashboard (Authentication → Add user).",
    };
  }

  const { error } = await supabase
    .from("organization_members")
    .insert({ organization_id: organizationId, user_id: userId, role: parsed.data.role });

  if (error) {
    return { error: "Toevoegen is mislukt — mogelijk is dit account al aan een organisatie gekoppeld." };
  }

  revalidatePath(`/beheer/${organizationId}`);
  return { error: null };
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: OrganizationRole,
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId);

  if (error) {
    return { error: "Bijwerken is mislukt." };
  }

  revalidatePath(`/beheer/${organizationId}`);
  return { error: null };
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string,
): Promise<ActionResult> {
  await requirePlatformAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("organization_members").delete().eq("id", memberId);

  if (error) {
    return { error: "Verwijderen is mislukt." };
  }

  revalidatePath(`/beheer/${organizationId}`);
  return { error: null };
}
