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
