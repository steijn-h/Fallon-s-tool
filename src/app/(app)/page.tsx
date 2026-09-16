import Link from "next/link";
import { Award, Banknote, TrendingUp, Users } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { PipelineAreaChart } from "@/components/shared/pipeline-area-chart";
import { StatCard } from "@/components/shared/stat-card";
import { TargetBar } from "@/components/shared/target-bar";
import { Card, CardContent } from "@/components/ui/card";
import { compactCurrency, computeRenewalRate, durationYears, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Sponsorship } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();

  const [
    { data: prospects },
    { data: sponsorshipRows },
    { data: pipelineStages },
    { data: targets },
    { data: openTasks },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from("prospects").select("id, company, est_value, probability, stage_id"),
    supabase
      .from("sponsorships")
      .select("id, company, value, status, start_date, end_date, created_at, renewed_from_id"),
    supabase.from("pipeline_stages").select("id, label, type, sort_order").order("sort_order"),
    supabase.from("year_targets").select("*").eq("id", 1).single(),
    supabase
      .from("tasks")
      .select("id, title, due_date, prospect_id")
      .eq("completed", false)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("activities")
      .select("id, title, type, occurred_at, sponsorship_id")
      .order("occurred_at", { ascending: false })
      .limit(6),
  ]);

  const taskProspectIds = [...new Set((openTasks ?? []).map((t) => t.prospect_id))];
  const activitySponsorshipIds = [...new Set((recentActivities ?? []).map((a) => a.sponsorship_id))];

  const [{ data: taskProspects }, { data: activitySponsorships }] = await Promise.all([
    taskProspectIds.length > 0
      ? supabase.from("prospects").select("id, company").in("id", taskProspectIds)
      : Promise.resolve({ data: [] as { id: string; company: string }[] }),
    activitySponsorshipIds.length > 0
      ? supabase.from("sponsorships").select("id, company").in("id", activitySponsorshipIds)
      : Promise.resolve({ data: [] as { id: string; company: string }[] }),
  ]);

  const companyByProspectId = new Map((taskProspects ?? []).map((p) => [p.id, p.company]));
  const companyBySponsorshipId = new Map((activitySponsorships ?? []).map((s) => [s.id, s.company]));

  const sponsorships: Pick<
    Sponsorship,
    "id" | "company" | "value" | "status" | "startDate" | "endDate" | "createdAt" | "renewedFromId"
  >[] = (sponsorshipRows ?? []).map((s) => ({
    id: s.id,
    company: s.company,
    value: s.value,
    status: s.status,
    startDate: s.start_date,
    endDate: s.end_date,
    createdAt: s.created_at,
    renewedFromId: s.renewed_from_id,
  }));

  const openStageIds = new Set((pipelineStages ?? []).filter((s) => s.type === "open").map((s) => s.id));
  const pipelineExpectedValue = (prospects ?? [])
    .filter((p) => openStageIds.has(p.stage_id))
    .reduce((sum, p) => sum + (p.est_value * p.probability) / 100, 0);

  const activeValue = sponsorships
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.value, 0);

  const sponsorsThisYear = sponsorships.filter(
    (s) => new Date(s.startDate).getFullYear() === currentYear,
  ).length;

  const { data: paidPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "paid");
  const totalCollected = (paidPayments ?? []).reduce((sum, p) => sum + p.amount, 0);

  const renewalRate = computeRenewalRate(sponsorships as Sponsorship[], currentYear);

  const pipelineChartData = (pipelineStages ?? [])
    .filter((s) => s.type === "open")
    .map((stage) => ({
      stage: stage.label,
      value: (prospects ?? [])
        .filter((p) => p.stage_id === stage.id)
        .reduce((sum, p) => sum + p.est_value, 0),
    }));

  const activeContracts = sponsorships.filter((s) => s.status === "active");
  const durationBuckets = { y1: 0, y3: 0, y5: 0 };
  for (const s of activeContracts) {
    const years = durationYears(s.startDate, s.endDate);
    if (years >= 4.5) durationBuckets.y5 += 1;
    else if (years >= 2.5) durationBuckets.y3 += 1;
    else durationBuckets.y1 += 1;
  }
  const totalDurationContracts = activeContracts.length || 1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Overzicht van acquisitie en lopende sponsorschappen." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Verwachte pipelinewaarde"
          value={compactCurrency(pipelineExpectedValue)}
          delta="Open prospects × slagingskans"
          icon={TrendingUp}
        />
        <StatCard label="Actieve sponsorwaarde" value={compactCurrency(activeValue)} icon={Award} />
        <StatCard
          label={`Sponsors in ${currentYear}`}
          value={String(sponsorsThisYear)}
          icon={Users}
        />
        <StatCard label="Geïnd" value={compactCurrency(totalCollected)} icon={Banknote} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <SectionTitle>Jaartargets {currentYear}</SectionTitle>
            <TargetBar
              label="Aantal sponsors"
              currentLabel={String(sponsorsThisYear)}
              targetLabel={String(targets?.sponsor_count ?? 0)}
              percentage={((sponsorsThisYear || 0) / (targets?.sponsor_count || 1)) * 100}
            />
            <TargetBar
              label="Sponsorbedrag"
              currentLabel={compactCurrency(activeValue)}
              targetLabel={compactCurrency(targets?.sponsor_amount ?? 0)}
              percentage={(activeValue / (targets?.sponsor_amount || 1)) * 100}
            />
            <TargetBar
              label="Verlengingspercentage"
              currentLabel={`${renewalRate}%`}
              targetLabel={`${targets?.renewal_rate ?? 0}%`}
              percentage={(renewalRate / (targets?.renewal_rate || 1)) * 100}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Pipelinewaarde per fase</SectionTitle>
            <PipelineAreaChart data={pipelineChartData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Looptijd actieve contracten</SectionTitle>
            {[
              { key: "y1", label: "Tot 2,5 jaar" },
              { key: "y3", label: "2,5 - 4,5 jaar" },
              { key: "y5", label: "5+ jaar" },
            ].map((bucket) => {
              const count = durationBuckets[bucket.key as keyof typeof durationBuckets];
              return (
                <div key={bucket.key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{bucket.label}</span>
                  <span className="font-medium">
                    {count} ({Math.round((count / totalDurationContracts) * 100)}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Openstaande taken</SectionTitle>
            {(openTasks ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen openstaande taken.</p>
            ) : (
              (openTasks ?? []).map((task) => (
                <Link
                  key={task.id}
                  href={`/prospects/${task.prospect_id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="truncate">{task.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {companyByProspectId.get(task.prospect_id) ?? ""} · {formatDate(task.due_date)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Recente activiteiten</SectionTitle>
            {(recentActivities ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen activiteiten.</p>
            ) : (
              (recentActivities ?? []).map((activity) => (
                <Link
                  key={activity.id}
                  href={`/sponsorschappen/${activity.sponsorship_id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="truncate">{activity.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {companyBySponsorshipId.get(activity.sponsorship_id) ?? ""}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
