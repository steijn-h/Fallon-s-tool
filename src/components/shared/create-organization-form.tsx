"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { createOrganization } from "@/lib/actions/platform-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrganizationForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createOrganization({ error: null }, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Organisatie aangemaakt");
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-name">Naam</Label>
        <Input id="org-name" name="name" required placeholder="Bijv. FC Twente" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-package">Pakket</Label>
        <select
          id="org-package"
          name="packageType"
          defaultValue="b"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="a">a — Evenementen</option>
          <option value="b">b — Standaard</option>
          <option value="c">c — Citymarketing</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Aanmaken..." : "Organisatie aanmaken"}
      </Button>
    </form>
  );
}
