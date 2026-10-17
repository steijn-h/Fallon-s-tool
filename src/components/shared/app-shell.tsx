import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/login/actions";
import { MobileNav, SidebarNav } from "@/components/shared/sidebar-nav";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background md:flex">
        <div className="px-4 py-5">
          <span className="font-display text-lg font-bold text-gradient-brand">SponsorHub</span>
          {organizationName ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{organizationName}</p>
          ) : null}
        </div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border p-3">
          {isPlatformAdmin ? (
            <Link
              href="/beheer"
              className="rounded-md border border-sidebar-border/70 bg-card px-3 py-2 text-center text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Naar beheerportaal
            </Link>
          ) : null}
          {email ? <p className="truncate px-1 text-xs text-muted-foreground">{email}</p> : null}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Uitloggen
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-display text-base font-bold text-gradient-brand">SponsorHub</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Uitloggen
              </Button>
            </form>
          </div>
          <MobileNav />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
