"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface StatDetailRow {
  label: string;
  value: string;
  href?: string;
}

export function ClickableStatCard({
  label,
  value,
  delta,
  icon,
  tone = "default",
  detailTitle,
  rows,
  viewAllHref,
}: {
  label: string;
  value: string;
  delta?: string;
  // A rendered icon element (e.g. <TrendingUp className="size-5" />), not a
  // component reference — a bare component/function can't cross the
  // server→client prop boundary, only already-rendered JSX can.
  icon: ReactNode;
  tone?: "default" | "success" | "destructive";
  detailTitle: string;
  rows: StatDetailRow[];
  viewAllHref?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
        <Card>
          <CardContent className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-display mt-1 text-2xl font-semibold text-foreground">{value}</p>
              {delta ? (
                <p
                  className={cn(
                    "mt-1 text-xs font-medium",
                    tone === "success" && "text-success",
                    tone === "destructive" && "text-destructive",
                    tone === "default" && "text-muted-foreground",
                  )}
                >
                  {delta}
                </p>
              ) : null}
            </div>
            <div className="rounded-md bg-secondary p-2 text-primary">{icon}</div>
          </CardContent>
        </Card>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen gegevens.</p>
            ) : (
              rows.map((row, i) =>
                row.href ? (
                  <Link
                    key={i}
                    href={row.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 text-muted-foreground">{row.value}</span>
                  </Link>
                ) : (
                  <div key={i} className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 text-muted-foreground">{row.value}</span>
                  </div>
                ),
              )
            )}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Bekijk volledige lijst →
            </Link>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
