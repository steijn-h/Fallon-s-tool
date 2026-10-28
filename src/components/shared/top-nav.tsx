"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Banknote,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";

import { ARCHETYPES } from "@/lib/archetypes";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/acquisitie", label: "Acquisitie", icon: Target },
  { href: "/sponsorschappen", label: "Sponsorschappen", icon: Award },
  { href: "/evenementen", label: "Evenementen", icon: CalendarDays },
  { href: "/archetypes", label: "Archetypen", icon: Sparkles },
  { href: "/beoordeling", label: "Beoordeling", icon: ListChecks },
  { href: "/handvatten", label: "Handvatten", icon: SlidersHorizontal },
  { href: "/financieel", label: "Financieel", icon: Banknote },
] as const;

function isItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = isItemActive(pathname, item.href);
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors active:scale-[0.98]",
              isActive
                ? "border-primary bg-primary font-semibold text-primary-foreground shadow-brand"
                : "border-transparent text-foreground hover:border-border hover:bg-accent active:bg-accent",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );

        if (item.href !== "/sponsorschappen") return link;

        return (
          <div key={item.href} className="group relative">
            {link}
            <div className="invisible absolute top-full left-0 z-50 pt-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
              <div className="w-64 rounded-md border border-border bg-popover p-1.5 shadow-lg">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Filter op archetype</p>
                {ARCHETYPES.map((a) => (
                  <Link
                    key={a.id}
                    href={`/sponsorschappen?archetypeId=${a.id}`}
                    className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{a.name}</span>
                    <span className="block text-xs text-muted-foreground">{a.companyType}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
      {NAV_ITEMS.map((item) => {
        const isActive = isItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
