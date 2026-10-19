import { Banknote, FileClock, TrendingDown, TrendingUp } from "lucide-react";

import { FinancialEntriesTable } from "@/components/shared/financial-entries-table";
import { NewFinancialEntryDialog } from "@/components/shared/new-financial-entry-dialog";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { compactCurrency, currency } from "@/lib/format";
import { FINANCIAL_CATEGORY_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function FinancieelPage() {
  const supabase = await createClient();

  const [
    { data: events },
    { data: entries },
    { data: sponsorships },
    { data: eventPackages },
    { data: deliverables },
    { data: payments },
  ] = await Promise.all([
    supabase.from("events").select("id, name").order("name"),
    supabase.from("financial_entries").select("*").order("entry_date", { ascending: false }),
    supabase.from("sponsorships").select("id, company, value, event_package_id"),
    supabase.from("event_packages").select("id, event_id"),
    supabase.from("deliverables").select("id, title, sponsorship_id"),
    supabase.from("payments").select("amount, status"),
  ]);

  const eventById = new Map((events ?? []).map((e) => [e.id, e]));
  const packageById = new Map((eventPackages ?? []).map((p) => [p.id, p]));
  const sponsorshipById = new Map((sponsorships ?? []).map((s) => [s.id, s]));

  const eventIdBySponsorshipId = new Map(
    (sponsorships ?? []).map((s) => [s.id, packageById.get(s.event_package_id)?.event_id ?? null]),
  );

  const deliverableOptions = (deliverables ?? []).map((d) => {
    const sponsorship = sponsorshipById.get(d.sponsorship_id);
    return { id: d.id, label: `${d.title}${sponsorship ? ` — ${sponsorship.company}` : ""}` };
  });
  const deliverableLabelById = new Map(deliverableOptions.map((d) => [d.id, d.label]));

  const totalSponsorRevenue = (sponsorships ?? []).reduce((sum, s) => sum + s.value, 0);
  const totalCollected = (payments ?? []).filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = (payments ?? [])
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOtherIncome = (entries ?? [])
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = (entries ?? [])
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const netResult = totalSponsorRevenue + totalOtherIncome - totalExpenses;

  const perEvent = (events ?? []).map((event) => {
    const eventEntries = (entries ?? []).filter((e) => e.event_id === event.id);
    const income = eventEntries.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
    const expense = eventEntries.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
    const sponsorRevenue = (sponsorships ?? [])
      .filter((s) => eventIdBySponsorshipId.get(s.id) === event.id)
      .reduce((sum, s) => sum + s.value, 0);
    const byCategory = (["direct", "indirect", "goodwill"] as const).map((category) => ({
      category,
      income: eventEntries
        .filter((e) => e.type === "income" && e.category === category)
        .reduce((sum, e) => sum + e.amount, 0),
      expense: eventEntries
        .filter((e) => e.type === "expense" && e.category === category)
        .reduce((sum, e) => sum + e.amount, 0),
    }));
    return { event, sponsorRevenue, income, expense, net: sponsorRevenue + income - expense, byCategory };
  });

  const tableRows = (entries ?? []).map((e) => ({
    id: e.id,
    eventName: eventById.get(e.event_id)?.name ?? "Onbekend evenement",
    deliverableLabel: e.deliverable_id ? deliverableLabelById.get(e.deliverable_id) ?? null : null,
    type: e.type,
    category: e.category,
    description: e.description,
    amount: e.amount,
    entry_date: e.entry_date,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financieel"
        subtitle="Kosten, opbrengsten en facturen per evenement."
        actions={<NewFinancialEntryDialog events={events ?? []} deliverables={deliverableOptions} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Totale opbrengsten" value={compactCurrency(totalSponsorRevenue + totalOtherIncome)} icon={TrendingUp} />
        <StatCard label="Totale kosten" value={compactCurrency(totalExpenses)} icon={TrendingDown} />
        <StatCard
          label="Netto resultaat"
          value={compactCurrency(netResult)}
          icon={Banknote}
          tone={netResult >= 0 ? "success" : "destructive"}
        />
        <StatCard
          label="Nog te innen"
          value={compactCurrency(totalOutstanding)}
          delta={`${compactCurrency(totalCollected)} al geïnd`}
          icon={FileClock}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Per evenement</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {perEvent.map(({ event, sponsorRevenue, income, expense, net, byCategory }) => (
              <div key={event.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{event.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sponsoring {currency(sponsorRevenue)} · Overig {currency(income)} · Kosten {currency(expense)}
                </p>
                <p className={`mt-1 text-sm font-semibold ${net >= 0 ? "text-success" : "text-destructive"}`}>
                  Netto {currency(net)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {byCategory
                    .filter((c) => c.income > 0 || c.expense > 0)
                    .map((c) => (
                      <span
                        key={c.category}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {FINANCIAL_CATEGORY_LABELS[c.category]}: +{currency(c.income)} / -{currency(c.expense)}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <SectionTitle>Alle posten</SectionTitle>
          <FinancialEntriesTable entries={tableRows} />
        </CardContent>
      </Card>
    </div>
  );
}
