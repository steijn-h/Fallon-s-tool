export const IMPORTABLE_FIELDS = [
  { key: "company", label: "Bedrijfsnaam" },
  { key: "industry", label: "Branche" },
  { key: "city", label: "Plaats" },
  { key: "website", label: "Website" },
  { key: "companyType", label: "Type bedrijf" },
  { key: "dmuName", label: "DMU-naam" },
  { key: "dmuPhone", label: "DMU-telefoon" },
  { key: "leadWarmth", label: "Leadwarmte" },
  { key: "organizationSize", label: "Bedrijfsgrootte" },
  { key: "estValue", label: "Geschatte waarde" },
  { key: "probability", label: "Slagingskans" },
  { key: "source", label: "Bron" },
  { key: "notes", label: "Notities" },
] as const;

export type ImportableFieldKey = (typeof IMPORTABLE_FIELDS)[number]["key"];

const HEURISTICS: Record<ImportableFieldKey, RegExp> = {
  company: /bedrijf|company|naam|organisatie|name/i,
  industry: /branche|industry|sector/i,
  city: /stad|city|locatie|place/i,
  website: /website|url|domain|site/i,
  companyType: /type|soort/i,
  dmuName: /dmu|beslisser|contact.?naam/i,
  dmuPhone: /telefoon|phone|tel|nummer/i,
  leadWarmth: /warmte|warmth/i,
  organizationSize: /grootte|size|medewerk|employees|fte/i,
  estValue: /waarde|value|bedrag|amount|€|euro/i,
  probability: /kans|prob|likelihood|success/i,
  source: /bron|source/i,
  notes: /notitie|note|omschrijving/i,
};

/** Best-effort column -> field guess based on the header name, used to
 * pre-fill the mapping dropdowns so most imports need zero manual mapping. */
export function autoMapColumn(header: string): ImportableFieldKey | null {
  for (const field of IMPORTABLE_FIELDS) {
    if (HEURISTICS[field.key].test(header)) return field.key;
  }
  return null;
}
