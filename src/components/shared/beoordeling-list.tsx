"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ARCHETYPES } from "@/lib/archetypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyMark } from "@/components/shared/company-mark";
import { StatusBadge, TierBadge } from "@/components/shared/status-badges";
import { ORGANIZATION_SIZES, type ArchetypeId, type OrganizationSize } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type SponsorshipRow = Pick<
  Database["public"]["Tables"]["sponsorships"]["Row"],
  "id" | "company" | "logo_color" | "tier" | "status" | "archetype_id" | "prospect_id"
>;
type ProspectRow = Pick<
  Database["public"]["Tables"]["prospects"]["Row"],
  "id" | "company" | "company_type" | "organization_size"
>;

export function BeoordelingList({
  sponsorships,
  prospects,
}: {
  sponsorships: SponsorshipRow[];
  prospects: ProspectRow[];
}) {
  const [search, setSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState<ArchetypeId | "all">("all");
  const [sizeFilter, setSizeFilter] = useState<OrganizationSize | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const prospectById = useMemo(() => new Map(prospects.map((p) => [p.id, p])), [prospects]);
  const prospectByCompany = useMemo(
    () => new Map(prospects.map((p) => [p.company.toLowerCase(), p])),
    [prospects],
  );

  function linkedProspect(s: SponsorshipRow): ProspectRow | undefined {
    if (s.prospect_id) return prospectById.get(s.prospect_id);
    return prospectByCompany.get(s.company.toLowerCase());
  }

  const companyTypes = useMemo(
    () => [...new Set(prospects.map((p) => p.company_type).filter((v): v is string => !!v))],
    [prospects],
  );

  const hasActiveFilters = search !== "" || archetypeFilter !== "all" || sizeFilter !== "all" || typeFilter !== "all";

  const filtered = sponsorships.filter((s) => {
    if (search && !s.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (archetypeFilter !== "all" && s.archetype_id !== archetypeFilter) return false;
    const prospect = linkedProspect(s);
    if (sizeFilter !== "all" && prospect?.organization_size !== sizeFilter) return false;
    if (typeFilter !== "all" && prospect?.company_type !== typeFilter) return false;
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
        <Select value={archetypeFilter} onValueChange={(v) => setArchetypeFilter(v as ArchetypeId | "all")}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Archetype" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle archetypen</SelectItem>
            {ARCHETYPES.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v as OrganizationSize | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Organisatiegrootte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle groottes</SelectItem>
            {ORGANIZATION_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size} medewerkers
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type bedrijf" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle types</SelectItem>
            {companyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setArchetypeFilter("all");
              setSizeFilter("all");
              setTypeFilter("all");
            }}
          >
            <RotateCcw /> Reset
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Geen sponsorschappen gevonden.</p>
        ) : (
          filtered.map((s) => (
            <Link key={s.id} href={`/beoordeling/${s.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <CompanyMark name={s.company} color={s.logo_color} />
                  <div>
                    <p className="text-sm font-medium">{s.company}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <TierBadge tier={s.tier} />
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
