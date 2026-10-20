"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateMemberAccessLevel } from "@/lib/actions/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/page-header";
import type { AccessLevel, OrganizationRole } from "@/lib/supabase/database.types";

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  full: "Alles",
  assigned: "Eigen profielen",
  readonly: "Alleen bekijken",
};

export interface MemberRow {
  id: string;
  email: string;
  role: OrganizationRole;
  access_level: AccessLevel;
}

export function PermissionsSettingsCard({ members }: { members: MemberRow[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SectionTitle>Rechten</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Wat een medewerker mag bewerken: alles, alleen de prospects/sponsorschappen waar diegene als
          dealverantwoordelijke aan gekoppeld is, of alleen bekijken zonder te kunnen wijzigen.
        </p>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5 text-sm"
            >
              <div>
                <p className="font-medium">{m.email}</p>
                <p className="text-xs text-muted-foreground">organisatierol: {m.role}</p>
              </div>
              <select
                value={m.access_level}
                disabled={pending}
                onChange={(e) =>
                  startTransition(async () => {
                    try {
                      await updateMemberAccessLevel(m.id, e.target.value as AccessLevel);
                      toast.success("Rechten bijgewerkt");
                    } catch {
                      toast.error("Bijwerken is mislukt.");
                    }
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
              >
                {(Object.keys(ACCESS_LEVEL_LABELS) as AccessLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {ACCESS_LEVEL_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen medewerkers.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
