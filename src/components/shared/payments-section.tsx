import { AddPaymentForm } from "@/components/shared/add-payment-form";
import { PaymentRow } from "@/components/shared/payment-row";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function PaymentsSection({ sponsorshipId }: { sponsorshipId: string }) {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, invoice_no, amount, due_date, paid_at, status")
    .eq("sponsorship_id", sponsorshipId)
    .order("due_date", { ascending: true });

  const paidTotal = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingTotal = (payments ?? [])
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-secondary p-3">
          <p className="text-xs text-muted-foreground">Betaald</p>
          <p className="font-display text-lg font-semibold text-success">{currency(paidTotal)}</p>
        </div>
        <div className="rounded-md border border-border bg-secondary p-3">
          <p className="text-xs text-muted-foreground">Openstaand</p>
          <p className="font-display text-lg font-semibold">{currency(outstandingTotal)}</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <AddPaymentForm sponsorshipId={sponsorshipId} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {(payments ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen betalingen.</p>
        ) : (
          (payments ?? []).map((p) => (
            <PaymentRow key={p.id} sponsorshipId={sponsorshipId} payment={p} />
          ))
        )}
      </div>
    </div>
  );
}
