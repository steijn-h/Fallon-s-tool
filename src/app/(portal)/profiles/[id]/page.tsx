import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { ProfilePackageHint as HintA } from "@/components/packages/a/profile-package-hint";
import { ProfilePackageHint as HintB } from "@/components/packages/b/profile-package-hint";
import { ProfilePackageHint as HintC } from "@/components/packages/c/profile-package-hint";
import { ArchiveProfileButton } from "@/components/shared/archive-profile-button";
import { EventsTab } from "@/components/shared/events-tab";
import { LeadSourceSection } from "@/components/shared/lead-source-section";
import { NotesTab } from "@/components/shared/notes-tab";
import { ProfileForm } from "@/components/shared/profile-form";
import { ScoreTab } from "@/components/shared/score-tab";
import { TasksTab } from "@/components/shared/tasks-tab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireSession } from "@/lib/auth/session";
import { PROFILE_STATUS_LABELS } from "@/lib/format";
import { getPackageFeatures, type ProfileTab } from "@/lib/packages/features";
import { createClient } from "@/lib/supabase/server";
import type { PackageType } from "@/lib/supabase/database.types";

const PACKAGE_HINTS: Record<PackageType, () => ReactElement> = {
  a: HintA,
  b: HintB,
  c: HintC,
};

const TAB_LABELS: Record<ProfileTab, string> = {
  nawte: "NAWTE",
  tasks: "Taken",
  notes: "Notities",
  score: "Score",
  events: "Evenementen",
};

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const features = getPackageFeatures(session.packageType);
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();

  if (!profile) {
    notFound();
  }

  let archetypes: { id: string; name: string }[] = [];
  if (features.showArchetype) {
    const { data } = await supabase.from("archetypes").select("id, name").order("name");
    archetypes = data ?? [];
  }

  const PackageHint = PACKAGE_HINTS[session.packageType];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{profile.organization_name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{PROFILE_STATUS_LABELS[profile.status]}</Badge>
            {profile.archived_at ? <Badge variant="outline">Gearchiveerd</Badge> : null}
          </div>
        </div>
        <ArchiveProfileButton profileId={profile.id} archived={Boolean(profile.archived_at)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="sr-only">Profieldetails</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={features.tabs[0]}>
              <TabsList>
                {features.tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {TAB_LABELS[tab]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {features.tabs.includes("nawte") ? (
                <TabsContent value="nawte" className="flex flex-col gap-6">
                  <ProfileForm
                    profile={profile}
                    customFields={features.customFields}
                    showArchetype={features.showArchetype}
                    archetypes={archetypes}
                  />
                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Leadafkomst</p>
                    <LeadSourceSection profileId={profile.id} />
                  </div>
                </TabsContent>
              ) : null}

              {features.tabs.includes("tasks") ? (
                <TabsContent value="tasks">
                  <TasksTab profileId={profile.id} />
                </TabsContent>
              ) : null}

              {features.tabs.includes("notes") ? (
                <TabsContent value="notes">
                  <NotesTab profileId={profile.id} />
                </TabsContent>
              ) : null}

              {features.tabs.includes("score") ? (
                <TabsContent value="score">
                  <ScoreTab profileId={profile.id} />
                </TabsContent>
              ) : null}

              {features.tabs.includes("events") ? (
                <TabsContent value="events">
                  <EventsTab profileId={profile.id} />
                </TabsContent>
              ) : null}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <PackageHint />
        </div>
      </div>
    </div>
  );
}
