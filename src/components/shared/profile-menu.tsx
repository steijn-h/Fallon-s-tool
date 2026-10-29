"use client";

import Link from "next/link";
import { Settings, Shield, User } from "lucide-react";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu({
  email,
  organizationName,
  isPlatformAdmin,
}: {
  email: string | null;
  organizationName: string | null;
  isPlatformAdmin: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="size-4" />
          {organizationName ?? "Account"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {email ? <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{email}</p> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/instellingen" className="flex items-center gap-2">
            <Settings className="size-4" /> Instellingen
          </Link>
        </DropdownMenuItem>
        {isPlatformAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/beheer" className="flex items-center gap-2">
              <Shield className="size-4" /> Beheerportaal
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full text-left">
              Uitloggen
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
