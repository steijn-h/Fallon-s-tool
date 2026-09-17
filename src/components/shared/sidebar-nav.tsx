"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  LayoutDashboard,
  ListChecks,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/acquisitie", label: "Acquisitie", icon: Target },
  { href: "/sponsorschappen", label: "Sponsorschappen", icon: Award },
  { href: "/archetypes", label: "Archetypen", icon: Sparkles },
  { href: "/beoordeling", label: "Beoordeling", icon: ListChecks },
  { href: "/handvatten", label: "Handvatten", icon: SlidersHorizontal },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98]",
              isActive
                ? "border-black/15 bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-brand"
                : "border-sidebar-border/70 bg-card text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent active:bg-sidebar-accent",
            )}
          >
            <Icon className="size-4" />
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
    <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
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
