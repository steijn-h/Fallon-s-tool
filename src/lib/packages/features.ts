import type { PackageType } from "@/lib/supabase/database.types";

export type ProfileTab = "nawte" | "tasks" | "notes" | "score" | "events";

export interface CustomFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea";
}

export interface PackageFeatures {
  packageType: PackageType;
  label: string;
  /** Tabs shown on the profile detail page, in display order. */
  tabs: ProfileTab[];
  /** Show the archetype picker on a profile (persona layer, filled in later). */
  showArchetype: boolean;
  /** Package-specific fields stored in profiles.custom_fields (jsonb). */
  customFields: CustomFieldDef[];
  /** Extra filters shown on the profiles list, beyond lead source (always available). */
  listFilters: Array<"archetype">;
}

// This is the single place that decides what a package unlocks. Nothing
// else in the app should branch on package_type directly — read the flags
// from here instead, so adding/adjusting a package later stays a one-file
// change.
const FEATURES: Record<PackageType, PackageFeatures> = {
  a: {
    packageType: "a",
    label: "Evenementen",
    tabs: ["nawte", "tasks", "notes", "score", "events"],
    showArchetype: false,
    customFields: [
      { key: "event_interest", label: "Interesse in editie", type: "text" },
      { key: "stand_wish", label: "Standwens", type: "textarea" },
    ],
    listFilters: [],
  },
  b: {
    packageType: "b",
    label: "Standaard",
    tabs: ["nawte", "tasks", "notes", "score"],
    showArchetype: false,
    customFields: [],
    listFilters: [],
  },
  c: {
    packageType: "c",
    label: "Citymarketing",
    tabs: ["nawte", "tasks", "notes", "score", "events"],
    showArchetype: true,
    customFields: [
      { key: "sector", label: "Sector / branche", type: "text" },
      { key: "region", label: "Regio", type: "text" },
    ],
    listFilters: ["archetype"],
  },
};

export function getPackageFeatures(packageType: PackageType): PackageFeatures {
  return FEATURES[packageType];
}

export function hasTab(packageType: PackageType, tab: ProfileTab): boolean {
  return FEATURES[packageType].tabs.includes(tab);
}
