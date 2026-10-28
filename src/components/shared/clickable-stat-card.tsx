"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";

import { StatCard } from "@/components/shared/stat-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "destructive";
  detailTitle: string;
  rows: StatDetailRow[];
  viewAllHref?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
        <StatCard label={label} value={value} delta={delta} icon={icon} tone={tone} />
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
