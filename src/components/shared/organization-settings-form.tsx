"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateOrganization } from "@/lib/actions/platform-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PackageType } from "@/lib/supabase/database.types";

export function OrganizationSettingsForm({
  organizationId,
  name,
  packageType,
}: {
  organizationId: string;
  name: string;
  packageType: PackageType;
}) {
  const [nameValue, setNameValue] = useState(name);
  const [packageValue, setPackageValue] = useState<PackageType>(packageType);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateOrganization(organizationId, {
        name: String(formData.get("name") ?? ""),
        packageType: formData.get("packageType") as PackageType,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Opgeslagen");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-settings-name">Naam</Label>
        <Input
          id="org-settings-name"
          name="name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-settings-package">Pakket</Label>
        <select
          id="org-settings-package"
          name="packageType"
          value={packageValue}
          onChange={(e) => setPackageValue(e.target.value as PackageType)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="a">a — Evenementen</option>
          <option value="b">b — Standaard</option>
          <option value="c">c — Citymarketing</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Opslaan..." : "Opslaan"}
      </Button>
    </form>
  );
}
