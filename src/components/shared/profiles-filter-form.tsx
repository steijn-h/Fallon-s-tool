"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFILE_STATUS_LABELS } from "@/lib/format";

interface Option {
  id: string;
  name: string;
}

export function ProfilesFilterForm({
  leadSources,
  archetypes,
}: {
  leadSources: Option[];
  archetypes: Option[] | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/profiles?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle statussen</SelectItem>
          {Object.entries(PROFILE_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("leadSource") ?? "all"}
        onValueChange={(value) => updateParam("leadSource", value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Leadafkomst" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle leadafkomsten</SelectItem>
          {leadSources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {archetypes ? (
        <Select
          defaultValue={searchParams.get("archetype") ?? "all"}
          onValueChange={(value) => updateParam("archetype", value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Archetype" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle archetypes</SelectItem>
            {archetypes.map((archetype) => (
              <SelectItem key={archetype.id} value={archetype.id}>
                {archetype.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select
        defaultValue={searchParams.get("archived") ?? "hide"}
        onValueChange={(value) => updateParam("archived", value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Archief" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hide">Zonder archief</SelectItem>
          <SelectItem value="only">Alleen archief</SelectItem>
          <SelectItem value="all">Inclusief archief</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
