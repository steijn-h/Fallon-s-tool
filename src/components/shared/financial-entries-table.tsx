"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteFinancialEntry } from "@/lib/actions/financial-entries";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency, formatDate } from "@/lib/format";
import { FINANCIAL_CATEGORY_LABELS, type FinancialEntryCategory, type FinancialEntryType } from "@/lib/types";

type Row = {
  id: string;
  eventName: string;
  deliverableLabel: string | null;
  type: FinancialEntryType;
  category: FinancialEntryCategory;
  description: string;
  amount: number;
  entry_date: string;
};

export function FinancialEntriesTable({ entries }: { entries: Row[] }) {
  const [pending, startTransition] = useTransition();

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nog geen financiële posten.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Evenement</TableHead>
          <TableHead>Omschrijving</TableHead>
          <TableHead>Categorie</TableHead>
          <TableHead>Bedrag</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="text-sm text-muted-foreground">{formatDate(entry.entry_date)}</TableCell>
            <TableCell>{entry.eventName}</TableCell>
            <TableCell>
              {entry.description}
              {entry.deliverableLabel ? (
                <span className="ml-1.5 text-xs text-muted-foreground">({entry.deliverableLabel})</span>
              ) : null}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {FINANCIAL_CATEGORY_LABELS[entry.category]}
            </TableCell>
            <TableCell className={entry.type === "expense" ? "text-destructive" : "text-success"}>
              {entry.type === "expense" ? "-" : "+"}
              {currency(entry.amount)}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await deleteFinancialEntry(entry.id);
                    } catch {
                      toast.error("Verwijderen is mislukt.");
                    }
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
