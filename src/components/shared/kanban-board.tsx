"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, X } from "lucide-react";

import { ARCHETYPES } from "@/lib/archetypes";
import { moveProspectStage } from "@/lib/actions/prospects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WarmthBadge } from "@/components/shared/status-badges";
import { findOwner, OwnerAvatar } from "@/components/shared/owner-avatar";
import { compactCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORGANIZATION_SIZES, type ArchetypeId, type LeadWarmth, type OrganizationSize } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type ProspectRow = Pick<
  Database["public"]["Tables"]["prospects"]["Row"],
  | "id"
  | "company"
  | "industry"
  | "city"
  | "stage_id"
  | "est_value"
  | "probability"
  | "owner_id"
  | "lead_warmth"
  | "organization_size"
  | "company_type"
  | "archetype_id"
>;
type StageRow = Database["public"]["Tables"]["pipeline_stages"]["Row"];
type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];

export function KanbanBoard({
  prospects,
  stages,
  owners,
  initialIndustry,
}: {
  prospects: ProspectRow[];
  stages: StageRow[];
  owners: OwnerRow[];
  initialIndustry?: string;
}) {
  const [items, setItems] = useState(prospects);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<OrganizationSize | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<ArchetypeId | "all">("all");
  const [industryFilter, setIndustryFilter] = useState<string>(initialIndustry ?? "all");
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const companyTypes = useMemo(
    () => [...new Set(prospects.map((p) => p.company_type).filter((v): v is string => !!v))],
    [prospects],
  );
  const industries = useMemo(() => [...new Set(prospects.map((p) => p.industry))], [prospects]);

  const filtered = items.filter((p) => {
    if (search && !p.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (sizeFilter !== "all" && p.organization_size !== sizeFilter) return false;
    if (typeFilter !== "all" && p.company_type !== typeFilter) return false;
    if (archetypeFilter !== "all" && p.archetype_id !== archetypeFilter) return false;
    if (industryFilter !== "all" && p.industry !== industryFilter) return false;
    return true;
  });

  function handleDrop(stageId: string, prospectId: string) {
    setDragOverStage(null);
    setItems((prev) => prev.map((p) => (p.id === prospectId ? { ...p, stage_id: stageId } : p)));
    startTransition(async () => {
      await moveProspectStage(prospectId, stageId);
      router.refresh();
    });
  }

  const activeFilterCount = [
    sizeFilter !== "all",
    typeFilter !== "all",
    archetypeFilter !== "all",
    industryFilter !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setSearch("");
    setSizeFilter("all");
    setTypeFilter("all");
    setArchetypeFilter("all");
    setIndustryFilter("all");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek op bedrijfsnaam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v as OrganizationSize | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Bedrijfsgrootte" />
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
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Branche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle branches</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} van {items.length} prospects
          </span>
          {activeFilterCount > 0 || search ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={resetFilters}>
              <X className="size-3.5" /> Filters wissen ({activeFilterCount + (search ? 1 : 0)})
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const stageProspects = filtered.filter((p) => p.stage_id === stage.id);
          const isNarrow = stage.type !== "open";

          return (
            <div
              key={stage.id}
              className={cn("flex shrink-0 flex-col gap-2", isNarrow ? "w-56" : "w-72")}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.id);
              }}
              onDragLeave={() => setDragOverStage((prev) => (prev === stage.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                const prospectId = e.dataTransfer.getData("text/prospect-id");
                if (prospectId) handleDrop(stage.id, prospectId);
              }}
            >
              <div className="flex items-center gap-2 px-1">
                {stage.type === "won" ? <Trophy className="size-4 text-success" /> : null}
                {stage.type === "lost" ? <X className="size-4 text-destructive" /> : null}
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs text-muted-foreground">{stageProspects.length}</span>
              </div>

              <div
                className={cn(
                  "flex min-h-24 flex-col gap-2 rounded-lg p-1.5 transition-colors",
                  dragOverStage === stage.id && "bg-primary/5 ring-2 ring-inset ring-primary/60",
                )}
              >
                {stageProspects.map((prospect) => {
                  const owner = findOwner(owners, prospect.owner_id);
                  return (
                    <Link
                      key={prospect.id}
                      href={`/prospects/${prospect.id}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/prospect-id", prospect.id);
                      }}
                    >
                      <Card className="cursor-grab gap-2 py-3 transition-shadow hover:shadow-md active:cursor-grabbing">
                        <div className="flex flex-col gap-1.5 px-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium">{prospect.company}</span>
                            <WarmthBadge warmth={prospect.lead_warmth as LeadWarmth} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {prospect.industry}
                            {prospect.city ? ` · ${prospect.city}` : ""}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-sm font-semibold text-primary">
                              {compactCurrency(prospect.est_value)}
                            </span>
                            <OwnerAvatar owner={owner} size="sm" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
