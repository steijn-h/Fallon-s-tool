"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createProspect } from "@/lib/actions/prospects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INDUSTRIES, ORGANIZATION_SIZES, type LeadWarmth, type OrganizationSize } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type StageRow = Database["public"]["Tables"]["pipeline_stages"]["Row"];
type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];

const LEAD_WARMTHS: LeadWarmth[] = ["koud", "lauw", "warm", "heet"];

export function NewProspectDialog({ stages, owners }: { stages: StageRow[]; owners: OwnerRow[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [phoneNumbers, setPhoneNumbers] = useState<{ name: string; number: string }[]>([]);

  const openStages = stages.filter((s) => s.type === "open");

  function handleSubmit(formData: FormData) {
    const payload = {
      company: String(formData.get("company") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      website: (formData.get("website") as string) || null,
      city: (formData.get("city") as string) || null,
      companyType: (formData.get("companyType") as string) || null,
      dmuName: (formData.get("dmuName") as string) || null,
      dmuPhone: (formData.get("dmuPhone") as string) || null,
      leadWarmth: (formData.get("leadWarmth") as LeadWarmth) || "koud",
      organizationSize: (formData.get("organizationSize") as OrganizationSize) || null,
      estValue: Number(formData.get("estValue") ?? 0),
      probability: Number(formData.get("probability") ?? 0),
      source: (formData.get("source") as string) || null,
      notes: (formData.get("notes") as string) || null,
      ownerId: (formData.get("ownerId") as string) || null,
      archetypeId: null,
      stageId: String(formData.get("stageId") ?? openStages[0]?.id ?? ""),
      contacts: [],
      phoneNumbers: phoneNumbers.filter((p) => p.name && p.number),
    };

    startTransition(async () => {
      const result = await createProspect(payload);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Prospect aangemaakt");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nieuwe prospect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nieuwe prospect</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Bedrijfsnaam</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="industry">Branche</Label>
              <select
                id="industry"
                name="industry"
                required
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Plaats</Label>
              <Input id="city" name="city" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" placeholder="https://" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyType">Type bedrijf</Label>
              <Input id="companyType" name="companyType" placeholder="Bijv. MKB, corporate" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stageId">Pipeline-fase</Label>
              <select
                id="stageId"
                name="stageId"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                {openStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dmuName">DMU-naam</Label>
              <Input id="dmuName" name="dmuName" placeholder="Naam beslisser" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dmuPhone">DMU-telefoon</Label>
              <Input id="dmuPhone" name="dmuPhone" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leadWarmth">Leadwarmte</Label>
              <select
                id="leadWarmth"
                name="leadWarmth"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                {LEAD_WARMTHS.map((warmth) => (
                  <option key={warmth} value={warmth}>
                    {warmth}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="organizationSize">Bedrijfsgrootte</Label>
              <select
                id="organizationSize"
                name="organizationSize"
                defaultValue=""
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Onbekend</option>
                {ORGANIZATION_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} medewerkers
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estValue">Geschatte waarde (€)</Label>
              <Input id="estValue" name="estValue" type="number" min={0} defaultValue={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="probability">Slagingskans (%)</Label>
              <Input id="probability" name="probability" type="number" min={0} max={100} defaultValue={20} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ownerId">Eigenaar</Label>
              <select
                id="ownerId"
                name="ownerId"
                defaultValue=""
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">Niet toegewezen</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source">Bron</Label>
              <Input id="source" name="source" placeholder="Bijv. Website, beurs" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notities</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Telefoonnummers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhoneNumbers((prev) => [...prev, { name: "", number: "" }])}
              >
                <Plus /> Toevoegen
              </Button>
            </div>
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Naam"
                  value={phone.name}
                  onChange={(e) =>
                    setPhoneNumbers((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)),
                    )
                  }
                />
                <Input
                  placeholder="Nummer"
                  value={phone.number}
                  onChange={(e) =>
                    setPhoneNumbers((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, number: e.target.value } : p)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPhoneNumbers((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig..." : "Prospect aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
