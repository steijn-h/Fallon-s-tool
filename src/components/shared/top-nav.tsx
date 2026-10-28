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

/** Dark left-rail navigation, HubSpot-style layout in Stracq's own colors. */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const isActive = isItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-sidebar-accent text-sidebar-foreground"
                : "border-transparent text-sidebar-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
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
