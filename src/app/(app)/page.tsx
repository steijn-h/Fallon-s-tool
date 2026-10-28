import Link from "next/link";
import type { CSSProperties } from "react";
import { Award, Banknote, TrendingUp, Users } from "lucide-react";

import { ClickableStatCard } from "@/components/shared/clickable-stat-card";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { PipelineAreaChart } from "@/components/shared/pipeline-area-chart";
import { TargetBar } from "@/components/shared/target-bar";
import { Card, CardContent } from "@/components/ui/card";
import { compactCurrency, currency, computeRenewalRate, durationYears, formatDate } from "@/lib/format";
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
    { data: paidPayments },
    { data: eventPackages },
  ] = await Promise.all([
    supabase.from("prospects").select("id, company, est_value, probability, stage_id, industry"),
    supabase
      .from("sponsorships")
      .select("id, company, value, status, start_date, end_date, created_at, renewed_from_id, event_package_id"),
    supabase.from("pipeline_stages").select("id, label, type, sort_order").order("sort_order"),
    supabase.from("year_targets").select("*").single(),
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
    supabase.from("payments").select("amount, sponsorship_id, paid_at").eq("status", "paid"),
    supabase.from("event_packages").select("id, name, color"),
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
  const companyBySponsorshipIdFull = new Map((sponsorshipRows ?? []).map((s) => [s.id, s.company]));

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

  const totalCollected = (paidPayments ?? []).reduce((sum, p) => sum + p.amount, 0);

  const openPipelineRows = (prospects ?? [])
    .filter((p) => openStageIds.has(p.stage_id))
    .sort((a, b) => b.est_value * b.probability - a.est_value * a.probability)
    .map((p) => ({
      label: p.company,
      value: currency((p.est_value * p.probability) / 100),
      href: `/prospects/${p.id}`,
    }));

  const activeSponsorshipRows = sponsorships
    .filter((s) => s.status === "active")
    .sort((a, b) => b.value - a.value)
    .map((s) => ({ label: s.company, value: currency(s.value), href: `/sponsorschappen/${s.id}` }));

  const sponsorsThisYearRows = sponsorships
    .filter((s) => new Date(s.startDate).getFullYear() === currentYear)
    .sort((a, b) => b.value - a.value)
    .map((s) => ({ label: s.company, value: currency(s.value), href: `/sponsorschappen/${s.id}` }));

  const collectedPaymentRows = (paidPayments ?? [])
    .sort((a, b) => b.amount - a.amount)
    .map((p) => ({
      label: companyBySponsorshipIdFull.get(p.sponsorship_id) ?? "Onbekende sponsor",
      value: `${currency(p.amount)} · ${formatDate(p.paid_at)}`,
      href: `/sponsorschappen/${p.sponsorship_id}`,
    }));

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
  const durationBuckets = { eenmalig: 0, y3: 0, y5: 0 };
  for (const s of activeContracts) {
    const years = durationYears(s.startDate, s.endDate);
    if (years >= 4) durationBuckets.y5 += 1;
    else if (years >= 1.5) durationBuckets.y3 += 1;
    else durationBuckets.eenmalig += 1;
  }
  const totalDurationContracts = activeContracts.length || 1;

  const branchCounts = new Map<string, number>();
  for (const p of prospects ?? []) {
    branchCounts.set(p.industry, (branchCounts.get(p.industry) ?? 0) + 1);
  }

  const packageById = new Map((eventPackages ?? []).map((p) => [p.id, p]));
  const packageStats = new Map<string, { count: number; value: number }>();
  for (const s of sponsorshipRows ?? []) {
    const pkg = packageById.get(s.event_package_id);
    if (!pkg) continue;
    const current = packageStats.get(pkg.id) ?? { count: 0, value: 0 };
    packageStats.set(pkg.id, { count: current.count + 1, value: current.value + s.value });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Overzicht van acquisitie en lopende sponsorschappen." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ClickableStatCard
          label="Verwachte pipelinewaarde"
          value={compactCurrency(pipelineExpectedValue)}
          delta="Open prospects × slagingskans"
          icon={<TrendingUp className="size-5" />}
          detailTitle="Open prospects (gewogen waarde)"
          rows={openPipelineRows}
          viewAllHref="/acquisitie"
        />
        <ClickableStatCard
          label="Actieve sponsorwaarde"
          value={compactCurrency(activeValue)}
          icon={<Award className="size-5" />}
          detailTitle="Actieve sponsorschappen"
          rows={activeSponsorshipRows}
          viewAllHref="/sponsorschappen?status=active"
        />
        <ClickableStatCard
          label={`Sponsors in ${currentYear}`}
          value={String(sponsorsThisYear)}
          icon={<Users className="size-5" />}
          detailTitle={`Sponsors gestart in ${currentYear}`}
          rows={sponsorsThisYearRows}
          viewAllHref="/sponsorschappen"
        />
        <ClickableStatCard
          label="Geïnd"
          value={compactCurrency(totalCollected)}
          icon={<Banknote className="size-5" />}
          detailTitle="Geïnde betalingen"
          rows={collectedPaymentRows}
          viewAllHref="/financieel"
        />
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

        <Link href="/acquisitie" className="block transition-opacity hover:opacity-90">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <SectionTitle>Pipelinewaarde per fase</SectionTitle>
              <PipelineAreaChart data={pipelineChartData} />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Looptijd actieve contracten</SectionTitle>
            {[
              { key: "eenmalig", label: "Eenmalig" },
              { key: "y3", label: "3 jaar" },
              { key: "y5", label: "5 jaar" },
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
            <SectionTitle
              action={
                <Link href="/taken" className="text-xs font-medium text-primary hover:underline">
                  Bekijk alles
                </Link>
              }
            >
              Openstaande taken
            </SectionTitle>
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
            <SectionTitle
              action={
                <Link href="/activiteiten" className="text-xs font-medium text-primary hover:underline">
                  Bekijk alles
                </Link>
              }
            >
              Recente activiteiten
            </SectionTitle>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Branches</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {[...branchCounts.entries()].map(([branch, count]) => (
                <Link
                  key={branch}
                  href={`/acquisitie?industry=${encodeURIComponent(branch)}`}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent"
                >
                  {branch} · {count}
                </Link>
              ))}
              {branchCounts.size === 0 ? (
                <p className="text-sm text-muted-foreground">Nog geen prospects met een branche.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <SectionTitle>Sponsorpakketten in gebruik</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-3">
              {[...packageStats.entries()].map(([pkgId, stat]) => {
                const pkg = packageById.get(pkgId)!;
                return (
                  <Link
                    key={pkgId}
                    href={`/sponsorschappen?packageId=${pkgId}`}
                    style={{ "--pkg-color": pkg.color } as CSSProperties}
                    className="rounded-md border p-2.5 border-[hsl(var(--pkg-color)/0.3)] bg-[hsl(var(--pkg-color)/0.08)] transition-opacity hover:opacity-80"
                  >
                    <p className="text-xs font-medium text-[hsl(var(--pkg-color))]">{pkg.name}</p>
                    <p className="text-sm font-semibold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{compactCurrency(stat.value)}</p>
                  </Link>
                );
              })}
              {packageStats.size === 0 ? (
                <p className="text-sm text-muted-foreground">Nog geen sponsorschappen.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
