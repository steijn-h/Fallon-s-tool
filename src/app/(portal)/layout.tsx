import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth/session";
import { Nav } from "@/components/shared/nav";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <Nav session={session} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
