"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { removeOrganizationMember, updateMemberRole } from "@/lib/actions/platform-admin";
import { Button } from "@/components/ui/button";
import type { OrganizationRole } from "@/lib/supabase/database.types";

export function OrganizationMemberRow({
  organizationId,
  memberId,
  email,
  role,
}: {
  organizationId: string;
  memberId: string;
  email: string | null;
  role: OrganizationRole;
}) {
  const [pending, startTransition] = useTransition();

  function handleRoleChange(newRole: OrganizationRole) {
    startTransition(async () => {
      const result = await updateMemberRole(organizationId, memberId, newRole);
      if (result.error) toast.error(result.error);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeOrganizationMember(organizationId, memberId);
      if (result.error) toast.error(result.error);
      else toast.success("Medewerker verwijderd");
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
      <span className="truncate">{email ?? memberId}</span>
      <div className="flex items-center gap-2">
        <select
          value={role}
          disabled={pending}
          onChange={(e) => handleRoleChange(e.target.value as OrganizationRole)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleRemove}>
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
