import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { requirePlatformAdmin } from "@/lib/auth/session";

export default async function BeheerLayout({ children }: { children: ReactNode }) {
  await requirePlatformAdmin();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/beheer" className="font-display text-lg font-bold text-gradient-brand">
            Beheerportaal
          </Link>
          <p className="text-xs text-muted-foreground">
            Organisaties en licenties — los van de Stracq-portalen zelf.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Terug naar Stracq</Link>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Uitloggen
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
