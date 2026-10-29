"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateYearTargets } from "@/lib/actions/year-targets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/shared/page-header";
import type { Database } from "@/lib/supabase/database.types";

type YearTargets = Database["public"]["Tables"]["year_targets"]["Row"];

export function YearTargetsForm({ targets }: { targets: YearTargets }) {
  const [sponsorCount, setSponsorCount] = useState(targets.sponsor_count);
  const [sponsorAmount, setSponsorAmount] = useState(targets.sponsor_amount);
  const [renewalRate, setRenewalRate] = useState(targets.renewal_rate);
  const [pending, startTransition] = useTransition();

  const isDirty = useMemo(
    () =>
      sponsorCount !== targets.sponsor_count ||
      sponsorAmount !== targets.sponsor_amount ||
      renewalRate !== targets.renewal_rate,
    [sponsorCount, sponsorAmount, renewalRate, targets],
  );

  function handleReset() {
    setSponsorCount(targets.sponsor_count);
    setSponsorAmount(targets.sponsor_amount);
    setRenewalRate(targets.renewal_rate);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateYearTargets({ error: null }, formData);
      if (result.error) toast.error(result.error);
      else toast.success("Jaartargets opgeslagen");
    });
  }

  return (
    <Card>
      <CardContent>
        <form action={handleSave} className="flex flex-col gap-4">
          <SectionTitle>Jaartargets</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sponsorCount">Aantal sponsors</Label>
              <Input
                id="sponsorCount"
                name="sponsorCount"
                type="number"
                min={0}
                value={sponsorCount}
                onChange={(e) => setSponsorCount(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sponsorAmount">Sponsorbedrag (€)</Label>
              <Input
                id="sponsorAmount"
                name="sponsorAmount"
                type="number"
                min={0}
                value={sponsorAmount}
                onChange={(e) => setSponsorAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="renewalRate">Verlengingspercentage</Label>
              <Input
                id="renewalRate"
                name="renewalRate"
                type="number"
                min={0}
                max={100}
                value={renewalRate}
                onChange={(e) => setRenewalRate(Number(e.target.value))}
              />
            </div>
          </div>
          {isDirty ? (
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Opslaan..." : "Opslaan"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Annuleren
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
