import { AddHandleForm } from "@/components/shared/add-handle-form";
import { HandleRow } from "@/components/shared/handle-row";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { HandleCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<HandleCategory, string> = {
  archetype: "Archetype",
  individual: "Individueel",
  both: "Beide",
};

export default async function HandvattenPage() {
  const supabase = await createClient();
  const { data: handles } = await supabase.from("handles").select("*").order("name");

  const grouped = (["both", "archetype", "individual"] as HandleCategory[]).map((category) => ({
    category,
    items: (handles ?? []).filter((h) => h.category === category),
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Handvatten"
        subtitle="Beoordelingscriteria waarop sponsorschappen worden gescoord."
      />

      <Card>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Elk handvat hieronder is een criterium waarop een sponsorschap wordt beoordeeld (zie het
            tabblad Beoordeling bij een sponsorschap). De score per handvat wordt automatisch berekend uit
            wat er over een sponsorschap is vastgelegd (deliverables op tijd/laat, betalingen, activiteit,
            looptijd) — je hoeft en kunt hier geen scores invullen.
          </p>
          <p>
            Wat je hier wél bepaalt: het <strong>gewicht</strong> van een handvat (1–5) — hoe zwaar het
            meetelt in de totale beoordelingsscore — en de <strong>categorie</strong>: &ldquo;Archetype&rdquo;
            voor criteria die vooral gaan over hoe goed de samenwerking bij het toegekende archetype past,
            &ldquo;Individueel&rdquo; voor criteria die per sponsor los van het archetype gelden, en
            &ldquo;Beide&rdquo; als het allebei is.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <AddHandleForm />
        </CardContent>
      </Card>

      {grouped.map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.category} className="flex flex-col gap-2">
              <SectionTitle>{CATEGORY_LABELS[group.category]}</SectionTitle>
              {group.items.map((handle) => (
                <HandleRow key={handle.id} handle={handle} />
              ))}
            </div>
          ),
      )}
    </div>
  );
}
