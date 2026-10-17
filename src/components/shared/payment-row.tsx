"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markPaymentPaid } from "@/lib/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currency, formatDate, formatDateTime } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type Payment = Pick<
  Database["public"]["Tables"]["payments"]["Row"],
  "id" | "invoice_no" | "amount" | "due_date" | "paid_at" | "status"
>;

export function PaymentRow({ sponsorshipId, payment }: { sponsorshipId: string; payment: Payment }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium">
          {payment.invoice_no ? `Factuur ${payment.invoice_no}` : "Betaling"} · {currency(payment.amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          Vervalt: {formatDate(payment.due_date)}
          {payment.paid_at ? ` · Betaald op ${formatDateTime(payment.paid_at)}` : ""}
        </p>
      </div>
      {payment.status === "paid" ? (
        <Badge>Betaald</Badge>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await markPaymentPaid(sponsorshipId, payment.id);
              router.refresh();
            })
          }
        >
          Markeer als betaald
        </Button>
      )}
    </div>
  );
}
