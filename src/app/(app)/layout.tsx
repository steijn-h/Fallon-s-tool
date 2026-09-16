import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { requireSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return <AppShell email={session.email}>{children}</AppShell>;
}
