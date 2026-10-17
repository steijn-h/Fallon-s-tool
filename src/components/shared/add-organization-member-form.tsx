"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { addOrganizationMember } from "@/lib/actions/platform-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddOrganizationMemberForm({ organizationId }: { organizationId: string }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addOrganizationMember(organizationId, { error: null }, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Medewerker toegevoegd");
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="member-email">E-mailadres</Label>
        <Input id="member-email" name="email" type="email" required placeholder="naam@organisatie.nl" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="member-role">Rol</Label>
        <select
          id="member-role"
          name="role"
          defaultValue="member"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Toevoegen..." : "Toevoegen"}
      </Button>
      <p className="w-full text-xs text-muted-foreground">
        Het account moet al bestaan (Supabase-dashboard → Authentication → Add user) — dit koppelt
        een bestaand account aan deze organisatie.
      </p>
    </form>
  );
}
