"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ProfileEventRole } from "@/lib/supabase/database.types";

const eventSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht"),
  location: z.string().trim().optional(),
  start_date: z.string().trim().optional(),
  end_date: z.string().trim().optional(),
});

export interface EventFormState {
  error: string | null;
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const session = await requireSession();

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location") ?? undefined,
    start_date: formData.get("start_date") ?? undefined,
    end_date: formData.get("end_date") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    organization_id: session.organizationId,
    name: parsed.data.name,
    location: parsed.data.location || null,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    created_by: session.userId,
  });

  if (error) {
    return { error: "Evenement aanmaken is mislukt." };
  }

  revalidatePath("/events");
  return { error: null };
}

export async function linkProfileToEvent(
  profileId: string,
  eventId: string,
  role: ProfileEventRole,
) {
  const session = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("profile_event_links").insert({
    profile_id: profileId,
    event_id: eventId,
    role,
    created_by: session.userId,
  });

  if (error) {
    throw new Error("Koppelen aan evenement is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
}

export async function unlinkProfileFromEvent(profileId: string, linkId: string) {
  await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("profile_event_links").delete().eq("id", linkId);

  if (error) {
    throw new Error("Ontkoppelen van evenement is mislukt.");
  }

  revalidatePath(`/profiles/${profileId}`);
}
