import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { OrganizationRole, PackageType } from "@/lib/supabase/database.types";

export interface CurrentSession {
  userId: string;
  email: string | null;
  organizationId: string;
  organizationName: string;
  packageType: PackageType;
  role: OrganizationRole;
}

/**
 * Resolves the signed-in user's single organization, its package_type and
 * the user's role in it. `cache()` de-dupes this per request so every server
 * component / server action on a page can call it without extra round-trips.
 * Every list/detail query in this app is expected to also be filtered by
 * RLS — this helper is for driving the UI, not a substitute for RLS.
 */
export const getCurrentSession = cache(async function getCurrentSession(): Promise<CurrentSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name, package_type")
    .eq("id", membership.organization_id)
    .single();

  if (organizationError || !organization) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    organizationId: organization.id,
    organizationName: organization.name,
    packageType: organization.package_type,
    role: membership.role,
  };
});

/** Use in server components/actions that require an authenticated, provisioned user. */
export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
