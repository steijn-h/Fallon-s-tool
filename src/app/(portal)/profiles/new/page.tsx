import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/shared/profile-form";
import { requireSession } from "@/lib/auth/session";
import { getPackageFeatures } from "@/lib/packages/features";
import { createClient } from "@/lib/supabase/server";

export default async function NewProfilePage() {
  const session = await requireSession();
  const features = getPackageFeatures(session.packageType);

  let archetypes: { id: string; name: string }[] = [];
  if (features.showArchetype) {
    const supabase = await createClient();
    const { data } = await supabase.from("archetypes").select("id, name").order("name");
    archetypes = data ?? [];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieuw profiel</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm
          customFields={features.customFields}
          showArchetype={features.showArchetype}
          archetypes={archetypes}
        />
      </CardContent>
    </Card>
  );
}
