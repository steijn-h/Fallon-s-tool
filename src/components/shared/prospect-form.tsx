"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updateProspect, type ProspectInput } from "@/lib/actions/prospects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARCHETYPES } from "@/lib/archetypes";
import { INDUSTRIES, ORGANIZATION_SIZES, type ArchetypeId, type LeadWarmth, type OrganizationSize } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type ProspectRow = Database["public"]["Tables"]["prospects"]["Row"];
type ContactRow = Database["public"]["Tables"]["prospect_contacts"]["Row"];
type PhoneRow = Database["public"]["Tables"]["prospect_phone_numbers"]["Row"];
type StageRow = Database["public"]["Tables"]["pipeline_stages"]["Row"];
type OwnerRow = Database["public"]["Tables"]["owners"]["Row"];

const LEAD_WARMTHS: LeadWarmth[] = ["koud", "lauw", "warm", "heet"];

export function ProspectForm({
  prospect,
  contacts,
  phoneNumbers,
  stages,
  owners,
}: {
  prospect: ProspectRow;
  contacts: ContactRow[];
  phoneNumbers: PhoneRow[];
  stages: StageRow[];
  owners: OwnerRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [contactList, setContactList] = useState(
    contacts.map((c) => ({ name: c.name, role: c.role, email: c.email, phone: c.phone })),
  );
  const [phoneList, setPhoneList] = useState(
    phoneNumbers.map((p) => ({ name: p.name, number: p.number })),
  );

  function handleSubmit(formData: FormData) {
    const payload: ProspectInput = {
      company: String(formData.get("company") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      website: (formData.get("website") as string) || null,
      city: (formData.get("city") as string) || null,
      companyType: (formData.get("companyType") as string) || null,
      dmuName: (formData.get("dmuName") as string) || null,
      dmuPhone: (formData.get("dmuPhone") as string) || null,
      leadWarmth: formData.get("leadWarmth") as LeadWarmth,
      organizationSize: ((formData.get("organizationSize") as string) || null) as OrganizationSize | null,
      estValue: Number(formData.get("estValue") ?? 0),
      probability: Number(formData.get("probability") ?? 0),
      source: (formData.get("source") as string) || null,
      notes: (formData.get("notes") as string) || null,
      nextStep: (formData.get("nextStep") as string) || null,
      nextStepDue: (formData.get("nextStepDue") as string) || null,
      ownerId: (formData.get("ownerId") as string) || null,
      archetypeId: ((formData.get("archetypeId") as string) || null) as ArchetypeId | null,
      stageId: String(formData.get("stageId") ?? ""),
      contacts: contactList.filter((c) => c.name.trim() !== ""),
      phoneNumbers: phoneList.filter((p) => p.name.trim() && p.number.trim()),
    };

    startTransition(async () => {
      const result = await updateProspect(prospect.id, payload);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Opgeslagen");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Bedrijfsnaam</Label>
          <Input id="company" name="company" defaultValue={prospect.company} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">Branche</Label>
          <select
            id="industry"
            name="industry"
            defaultValue={prospect.industry}
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
          <Input id="city" name="city" defaultValue={prospect.city ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={prospect.website ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyType">Type bedrijf</Label>
          <Input id="companyType" name="companyType" defaultValue={prospect.company_type ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stageId">Pipeline-fase</Label>
          <select
            id="stageId"
            name="stageId"
            defaultValue={prospect.stage_id}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dmuName">DMU-naam</Label>
          <Input id="dmuName" name="dmuName" defaultValue={prospect.dmu_name ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dmuPhone">DMU-telefoon</Label>
          <Input id="dmuPhone" name="dmuPhone" defaultValue={prospect.dmu_phone ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leadWarmth">Leadwarmte</Label>
          <select
            id="leadWarmth"
            name="leadWarmth"
            defaultValue={prospect.lead_warmth}
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
            defaultValue={prospect.organization_size ?? ""}
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
          <Input id="estValue" name="estValue" type="number" min={0} defaultValue={prospect.est_value} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="probability">Slagingskans (%)</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min={0}
            max={100}
            defaultValue={prospect.probability}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ownerId">Dealverantwoordelijke</Label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={prospect.owner_id ?? ""}
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
          <Label htmlFor="archetypeId">Archetype</Label>
          <select
            id="archetypeId"
            name="archetypeId"
            defaultValue={prospect.archetype_id ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            <option value="">Nog geen archetype</option>
            {ARCHETYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Bron</Label>
          <Input id="source" name="source" defaultValue={prospect.source ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nextStep">Volgende stap</Label>
          <Input id="nextStep" name="nextStep" defaultValue={prospect.next_step ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nextStepDue">Deadline volgende stap</Label>
          <Input
            id="nextStepDue"
            name="nextStepDue"
            type="date"
            defaultValue={prospect.next_step_due ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notities</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={prospect.notes ?? ""} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label>Contactpersonen</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setContactList((prev) => [...prev, { name: "", role: null, email: null, phone: null }])}
          >
            <Plus /> Toevoegen
          </Button>
        </div>
        {contactList.map((contact, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <Input
              placeholder="Naam"
              value={contact.name}
              onChange={(e) =>
                setContactList((prev) => prev.map((c, i) => (i === index ? { ...c, name: e.target.value } : c)))
              }
            />
            <Input
              placeholder="Functie"
              value={contact.role ?? ""}
              onChange={(e) =>
                setContactList((prev) => prev.map((c, i) => (i === index ? { ...c, role: e.target.value } : c)))
              }
            />
            <Input
              placeholder="E-mail"
              value={contact.email ?? ""}
              onChange={(e) =>
                setContactList((prev) => prev.map((c, i) => (i === index ? { ...c, email: e.target.value } : c)))
              }
            />
            <Input
              placeholder="Telefoon"
              value={contact.phone ?? ""}
              onChange={(e) =>
                setContactList((prev) => prev.map((c, i) => (i === index ? { ...c, phone: e.target.value } : c)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setContactList((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label>Telefoonnummers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPhoneList((prev) => [...prev, { name: "", number: "" }])}
          >
            <Plus /> Toevoegen
          </Button>
        </div>
        {phoneList.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Naam"
              value={phone.name}
              onChange={(e) =>
                setPhoneList((prev) => prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))
              }
            />
            <Input
              placeholder="Nummer"
              value={phone.number}
              onChange={(e) =>
                setPhoneList((prev) => prev.map((p, i) => (i === index ? { ...p, number: e.target.value } : p)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setPhoneList((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Opslaan..." : "Wijzigingen opslaan"}
        </Button>
      </div>
    </form>
  );
}
