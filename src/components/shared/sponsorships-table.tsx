"use client";

import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyMark } from "@/components/shared/company-mark";
import { findOwner, OwnerAvatar } from "@/components/shared/owner-avatar";
import { EventPackageBadge, StatusBadge } from "@/components/shared/status-badges";
import { compactCurrency, formatDate } from "@/lib/format";
import { STATUS_META, type SponsorshipStatus } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type SponsorshipRow = Pick<
  Database["public"]["Tables"]["sponsorships"]["Row"],
  | "id"
  | "company"
  | "industry"
  | "logo_color"
  | "event_package_id"
  | "status"
  | "value"
  | "start_date"
  | "end_date"
  | "owner_id"
>;
type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventPackageRow = Database["public"]["Tables"]["event_packages"]["Row"];

export function SponsorshipsTable({
  sponsorships,
  owners,
  events,
  packages,
  initialStatus,
  initialPackageId,
}: {
  sponsorships: SponsorshipRow[];
  owners: OwnerRow[];
  events: EventRow[];
  packages: EventPackageRow[];
  initialStatus?: SponsorshipStatus;
  initialPackageId?: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SponsorshipStatus | "all">(initialStatus ?? "all");
  const [eventFilter, setEventFilter] = useState<string | "all">("all");
  const [packageFilter, setPackageFilter] = useState<string | "all">(initialPackageId ?? "all");

  const packageById = new Map(packages.map((p) => [p.id, p]));

  const filtered = sponsorships.filter((s) => {
    if (search && !s.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (eventFilter !== "all" && packageById.get(s.event_package_id)?.event_id !== eventFilter) return false;
    if (packageFilter !== "all" && s.event_package_id !== packageFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Zoek op bedrijfsnaam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SponsorshipStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={eventFilter} onValueChange={(v) => setEventFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Evenement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle evenementen</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Pakket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle pakketten</SelectItem>
            {packages.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bedrijf</TableHead>
              <TableHead>Pakket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waarde</TableHead>
              <TableHead>Looptijd</TableHead>
              <TableHead>Dealverantwoordelijke</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Geen sponsorschappen gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const pkg = packageById.get(s.event_package_id);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/sponsorschappen/${s.id}`} className="flex items-center gap-2 font-medium hover:underline">
                        <CompanyMark name={s.company} color={s.logo_color} className="size-7 text-xs" />
                        {s.company}
                      </Link>
                    </TableCell>
                    <TableCell>{pkg ? <EventPackageBadge name={pkg.name} color={pkg.color} /> : null}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell>{compactCurrency(s.value)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(s.start_date)} – {formatDate(s.end_date)}
                    </TableCell>
                    <TableCell>
                      <OwnerAvatar owner={findOwner(owners, s.owner_id)} size="sm" showName />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
