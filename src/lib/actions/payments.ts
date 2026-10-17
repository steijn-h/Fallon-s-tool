"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const paymentSchema = z.object({
  invoiceNo: z.string().trim().nullable().default(null),
  amount: z.coerce.number().min(0),
  dueDate: z.string().trim().min(1),
});

export interface PaymentFormState {
  error: string | null;
}

export async function addPayment(
  sponsorshipId: string,
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  await requireSession();

  const parsed = paymentSchema.safeParse({
    invoiceNo: formData.get("invoiceNo") || null,
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    sponsorship_id: sponsorshipId,
    invoice_no: parsed.data.invoiceNo,
    amount: parsed.data.amount,
    due_date: parsed.data.dueDate,
  });

  if (error) {
    return { error: "Betaling toevoegen is mislukt." };
  }

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
  return { error: null };
}

export async function markPaymentPaid(sponsorshipId: string, paymentId: string) {
  await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", paymentId);

  if (error) throw new Error("Bijwerken is mislukt.");

  await supabase.from("activities").insert({
    sponsorship_id: sponsorshipId,
    type: "payment",
    title: "Betaling ontvangen",
  });

  revalidatePath(`/sponsorschappen/${sponsorshipId}`);
}
