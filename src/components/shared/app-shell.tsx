import type { ReactNode } from "react";

import { ProfileMenu } from "@/components/shared/profile-menu";
import { MobileNav, TopNav } from "@/components/shared/top-nav";

export function AppShell({
  email,
  organizationName,
  isPlatformAdmin,
  children,
}: {
  email: string | null;
  organizationName?: string | null;
  isPlatformAdmin?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-bold text-gradient-brand">Stracq</span>
            <TopNav />
          </div>
          <ProfileMenu
            email={email}
            organizationName={organizationName ?? null}
            isPlatformAdmin={!!isPlatformAdmin}
          />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
