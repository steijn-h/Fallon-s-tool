import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CurrentSession } from "@/lib/auth/session";
import { getPackageFeatures } from "@/lib/packages/features";

export function Nav({ session }: { session: CurrentSession }) {
  const features = getPackageFeatures(session.packageType);
  const showEvents = features.tabs.includes("events");

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/profiles" className="text-sm font-semibold">
            {session.organizationName}
          </Link>
          <Badge variant="secondary">Pakket {features.label}</Badge>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/profiles" className="hover:text-foreground">
              Profielen
            </Link>
            {showEvents ? (
              <Link href="/events" className="hover:text-foreground">
                Evenementen
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {session.email} &middot; {session.role}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Uitloggen
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
