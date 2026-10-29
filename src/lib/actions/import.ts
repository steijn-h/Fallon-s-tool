"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { LeadWarmth, OrganizationSize } from "@/lib/types";

const importRowSchema = z.object({
  company: z.string().trim().min(1),
  industry: z.string().trim().nullable().default(null),
  city: z.string().trim().nullable().default(null),
  website: z.string().trim().nullable().default(null),
  companyType: z.string().trim().nullable().default(null),
  dmuName: z.string().trim().nullable().default(null),
  dmuPhone: z.string().trim().nullable().default(null),
  leadWarmth: z.enum(["koud", "lauw", "warm", "heet"]).nullable().default(null),
  organizationSize: z
    .enum(["1-10", "11-50", "50-250", "250-1000", "1000+"])
    .nullable()
    .default(null),
  estValue: z.coerce.number().min(0).nullable().default(null),
  probability: z.coerce.number().min(0).max(100).nullable().default(null),
  source: z.string().trim().nullable().default(null),
  notes: z.string().trim().nullable().default(null),
});

export type ImportRow = z.input<typeof importRowSchema>;

export interface ImportResult {
  imported: number;
  skipped: number;
  error: string | null;
}

/** Bulk-imports prospects mapped from an uploaded Excel/CSV sheet (parsing
 * and column mapping happen client-side — this action only validates and
 * writes). Every imported row lands in the first "open" pipeline stage. */
export async function importProspects(rows: ImportRow[]): Promise<ImportResult> {
  await requireSession();
  const supabase = await createClient();

  const { data: firstOpenStage } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("type", "open")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstOpenStage) {
    return { imported: 0, skipped: rows.length, error: "Geen open pipeline-fase gevonden om naartoe te importeren." };
  }

  let imported = 0;
  let skipped = 0;

  const validRows = rows
    .map((row) => importRowSchema.safeParse(row))
    .filter((result) => {
      if (!result.success) skipped += 1;
      return result.success;
    })
    .map((result) => (result as { success: true; data: z.infer<typeof importRowSchema> }).data);

  if (validRows.length > 0) {
    const { error } = await supabase.from("prospects").insert(
      validRows.map((row) => ({
        company: row.company,
        industry: row.industry ?? "Overig",
        city: row.city,
        website: row.website,
        company_type: row.companyType,
        dmu_name: row.dmuName,
        dmu_phone: row.dmuPhone,
        lead_warmth: (row.leadWarmth ?? "koud") as LeadWarmth,
        organization_size: row.organizationSize as OrganizationSize | null,
        est_value: row.estValue ?? 0,
        probability: row.probability ?? 0,
        source: row.source,
        notes: row.notes,
        stage_id: firstOpenStage.id,
      })),
    );

    if (error) {
      return { imported: 0, skipped: rows.length, error: "Importeren is mislukt." };
    }
    imported = validRows.length;
  }

  revalidatePath("/acquisitie");
  return { imported, skipped, error: null };
}
