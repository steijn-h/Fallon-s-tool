"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Minimize2, Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/profile-menu";
import { MobileNav, TopNav } from "@/components/shared/top-nav";
import { cn } from "@/lib/utils";

const WIDTH_STORAGE_KEY = "stracq-layout-wide";

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
  const [wide, setWide] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WIDTH_STORAGE_KEY);
      // Reads a browser-only API after hydration, so the server-rendered
      // default (wide) always matches the client's first paint — this can't
      // move into a lazy useState initializer without a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setWide(stored === "true");
    } catch {
      // localStorage unavailable (private browsing, blocked site data) — keep the default.
    }
  }, []);

  function toggleWide() {
    setWide((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(WIDTH_STORAGE_KEY, String(next));
      } catch {
        // Per-viewer convenience only — fine if it doesn't persist.
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card">
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 md:px-8",
            wide ? "max-w-none" : "max-w-6xl",
          )}
        >
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-bold text-gradient-brand">Stracq</span>
            <TopNav />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={toggleWide}>
              {wide ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              {wide ? "Verkleinen" : "Verbreden"}
            </Button>
            <ProfileMenu
              email={email}
              organizationName={organizationName ?? null}
              isPlatformAdmin={!!isPlatformAdmin}
            />
          </div>
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </header>
      <main className={cn("mx-auto w-full flex-1 px-4 py-6 md:px-8", wide ? "max-w-none" : "max-w-6xl")}>
        {children}
      </main>
    </div>
  );
}
