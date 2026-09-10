"use client";

import { useActionState } from "react";

import { createProfile, updateProfile, type ProfileFormState } from "@/lib/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFILE_STATUS_LABELS } from "@/lib/format";
import type { CustomFieldDef } from "@/lib/packages/features";
import type { Database, ProfileStatus } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const initialState: ProfileFormState = { error: null };

export function ProfileForm({
  profile,
  customFields,
  showArchetype,
  archetypes,
}: {
  profile?: ProfileRow;
  customFields: CustomFieldDef[];
  showArchetype: boolean;
  archetypes: { id: string; name: string }[];
}) {
  const customFieldKeys = customFields.map((f) => f.key);
  const action = profile
    ? updateProfile.bind(null, profile.id, customFieldKeys)
    : createProfile.bind(null, customFieldKeys);

  const [state, formAction, pending] = useActionState(action, initialState);
  const values = profile?.custom_fields ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="organization_name">Naam organisatie</Label>
          <Input
            id="organization_name"
            name="organization_name"
            defaultValue={profile?.organization_name}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact_name">Contactpersoon</Label>
          <Input id="contact_name" name="contact_name" defaultValue={profile?.contact_name ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="street">Straat</Label>
          <Input id="street" name="street" defaultValue={profile?.street ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="house_number">Huisnummer</Label>
          <Input id="house_number" name="house_number" defaultValue={profile?.house_number ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="postal_code">Postcode</Label>
          <Input id="postal_code" name="postal_code" defaultValue={profile?.postal_code ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">Woonplaats</Label>
          <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Telefoon</Label>
          <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={(profile?.status ?? "lead") satisfies ProfileStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROFILE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showArchetype ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="archetype_id">Archetype</Label>
            <select
              id="archetype_id"
              name="archetype_id"
              defaultValue={profile?.archetype_id ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="">Nog geen archetype</option>
              {archetypes.map((archetype) => (
                <option key={archetype.id} value={archetype.id}>
                  {archetype.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {customFields.length > 0 ? (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground">Pakketspecifieke velden</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {customFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <Label htmlFor={`custom_${field.key}`}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`custom_${field.key}`}
                    name={`custom_${field.key}`}
                    defaultValue={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
                  />
                ) : (
                  <Input
                    id={`custom_${field.key}`}
                    name={`custom_${field.key}`}
                    defaultValue={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Opslaan..." : profile ? "Wijzigingen opslaan" : "Profiel aanmaken"}
        </Button>
      </div>
    </form>
  );
}
