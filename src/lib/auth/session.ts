import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export interface CurrentSession {
  userId: string;
  email: string | null;
}

/**
 * SponsorHub is single-club: every signed-in account has equal, full
 * access, so there is no organization/role to resolve here — just whether
 * someone is signed in. `cache()` de-dupes this per request.
 */
export const getCurrentSession = cache(async function getCurrentSession(): Promise<CurrentSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { userId: user.id, email: user.email ?? null };
});

/** Use in server components/actions that require an authenticated user. */
export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
