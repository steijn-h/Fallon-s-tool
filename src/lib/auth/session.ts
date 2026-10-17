import { redirect } from "next/navigation";
import { cache } from "react";

import type { OrganizationRole, PackageType } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export interface CurrentSession {
  userId: string;
  email: string | null;
  /** null for a platform admin with no organization of their own, or a
   * signed-in user who hasn't been added to an organization yet. */
  organizationId: string | null;
  organizationName: string | null;
  role: OrganizationRole | null;
  packageType: PackageType | null;
  isPlatformAdmin: boolean;
}

/**
 * Resolves the signed-in user's organization, role and package_type
 * (if any) and whether they're a platform admin. `cache()` de-dupes this
 * per request.
 */
export const getCurrentSession = cache(async function getCurrentSession(): Promise<CurrentSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: membership }, { data: platformAdmin }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("role, organizations(id, name, package_type)")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

  // Embedded selects don't type-check reliably against hand-written
  // Database types (no real foreign-key metadata), so the organization
  // fields are read via a loose cast rather than trusted inference.
  const org = membership?.organizations as unknown as
    | { id: string; name: string; package_type: PackageType }
    | null
    | undefined;

  return {
    userId: user.id,
    email: user.email ?? null,
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? null,
    role: membership?.role ?? null,
    packageType: org?.package_type ?? null,
    isPlatformAdmin: !!platformAdmin,
  };
});

/** Use in server components/actions that require an authenticated user. */
export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/** Use for pages that require an authenticated user who belongs to an organization. */
export async function requireOrganizationSession(): Promise<
  CurrentSession & { organizationId: string }
> {
  const session = await requireSession();

  if (!session.organizationId) {
    redirect("/geen-organisatie");
  }

  return session as CurrentSession & { organizationId: string };
}

/** Use in server components/actions reserved for the platform operator. */
export async function requirePlatformAdmin(): Promise<CurrentSession> {
  const session = await requireSession();

  if (!session.isPlatformAdmin) {
    redirect("/");
  }

  return session;
}
