import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ActiviteitenPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select("id, title, type, occurred_at, sponsorship_id")
    .order("occurred_at", { ascending: false })
    .limit(100);

  const sponsorshipIds = [...new Set((activities ?? []).map((a) => a.sponsorship_id))];
  const { data: sponsorships } =
    sponsorshipIds.length > 0
      ? await supabase.from("sponsorships").select("id, company").in("id", sponsorshipIds)
      : { data: [] as { id: string; company: string }[] };
  const companyBySponsorshipId = new Map((sponsorships ?? []).map((s) => [s.id, s.company]));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Activiteiten" subtitle="De laatste 100 activiteiten, over alle sponsorschappen." />

      <Card>
        <CardContent className="flex flex-col gap-2">
          {(activities ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen activiteiten.</p>
          ) : (
            (activities ?? []).map((activity) => (
              <Link
                key={activity.id}
                href={`/sponsorschappen/${activity.sponsorship_id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <span className="truncate">{activity.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {companyBySponsorshipId.get(activity.sponsorship_id) ?? ""} ·{" "}
                  {formatDateTime(activity.occurred_at)}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
