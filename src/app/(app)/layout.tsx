import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { requireSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  if (!session.organizationId) {
    // A platform admin with no organization of their own belongs in the
    // beheerportaal, not here. Anyone else without an organization hasn't
    // been added to one yet.
    redirect(session.isPlatformAdmin ? "/beheer" : "/geen-organisatie");
  }

  return (
    <AppShell
      email={session.email}
      organizationName={session.organizationName}
      isPlatformAdmin={session.isPlatformAdmin}
    >
      {children}
    </AppShell>
  );
}
