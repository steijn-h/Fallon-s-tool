"use client";

import { useState, useTransition } from "react";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  addReciprocalPerformance,
  addReciprocalPerformanceAction,
  deleteEventPackagePrice,
  deleteReciprocalPerformance,
  deleteReciprocalPerformanceAction,
  setEventPackagePriceForYear,
} from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type PriceRow = Database["public"]["Tables"]["event_package_prices"]["Row"];
type PerformanceRow = Database["public"]["Tables"]["reciprocal_performances"]["Row"];
type ActionRow = Database["public"]["Tables"]["reciprocal_performance_actions"]["Row"];

const currentYear = new Date().getFullYear();

function PriceHistorySection({ packageId, prices }: { packageId: string; prices: PriceRow[] }) {
  const [pending, startTransition] = useTransition();
  const [year, setYear] = useState(currentYear);
  const [value, setValue] = useState(0);
  const [costPrice, setCostPrice] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Prijsgeschiedenis (verkoopprijs & kostprijs per jaar)</p>
      <div className="flex flex-col gap-1.5">
        {[...prices]
          .sort((a, b) => b.year - a.year)
          .map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm"
            >
              <span>
                {p.year} · verkoop {currency(p.value)} · kostprijs {currency(p.cost_price)}
                {p.year === currentYear ? <span className="ml-1 text-xs text-primary">(huidig)</span> : null}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await deleteEventPackagePrice(p.id);
                    } catch {
                      toast.error("Verwijderen is mislukt.");
                    }
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        {prices.length === 0 ? <p className="text-xs text-muted-foreground">Nog geen prijsgeschiedenis.</p> : null}
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Jaar</Label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-8" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Verkoopprijs</Label>
          <Input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} className="h-8" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Kostprijs</Label>
          <Input
            type="number"
            min={0}
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            className="h-8"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await setEventPackagePriceForYear(packageId, year, value, costPrice);
                toast.success("Prijs opgeslagen");
              } catch {
                toast.error("Opslaan is mislukt.");
              }
            })
          }
        >
          Opslaan
        </Button>
      </div>
    </div>
  );
}

function PerformanceCard({ performance, actions }: { performance: PerformanceRow; actions: ActionRow[] }) {
  const [pending, startTransition] = useTransition();
  const [newAction, setNewAction] = useState("");

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{performance.title}</p>
          {performance.description ? (
            <p className="text-xs text-muted-foreground">{performance.description}</p>
          ) : null}
          {performance.perceived_value !== null ? (
            <p className="text-xs text-muted-foreground">
              Waargenomen waarde: {currency(performance.perceived_value)}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await deleteReciprocalPerformance(performance.id);
              } catch {
                toast.error("Verwijderen is mislukt.");
              }
            })
          }
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-1 pl-2">
        <p className="text-xs font-medium text-muted-foreground">Benodigde handelingen</p>
        {actions.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-2 text-xs">
            <span>· {a.title}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await deleteReciprocalPerformanceAction(a.id);
                  } catch {
                    toast.error("Verwijderen is mislukt.");
                  }
                })
              }
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
        {actions.length === 0 ? <p className="text-xs text-muted-foreground">Nog geen handelingen.</p> : null}
        <div className="mt-1 flex gap-1.5">
          <Input
            placeholder="Nieuwe handeling"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            className="h-7 text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7"
            disabled={pending || !newAction.trim()}
            onClick={() =>
              startTransition(async () => {
                try {
                  await addReciprocalPerformanceAction(performance.id, newAction);
                  setNewAction("");
                } catch {
                  toast.error("Toevoegen is mislukt.");
                }
              })
            }
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReciprocalPerformancesSection({
  packageId,
  performances,
  actionsByPerformanceId,
}: {
  packageId: string;
  performances: PerformanceRow[];
  actionsByPerformanceId: Map<string, ActionRow[]>;
}) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [perceivedValue, setPerceivedValue] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Wederkerige prestaties</p>
      <p className="text-xs text-muted-foreground">
        Wat de sponsor in ruil voor dit pakket krijgt, met de handelingen die nodig zijn om dat te leveren.
      </p>
      <div className="flex flex-col gap-2">
        {performances.map((p) => (
          <PerformanceCard key={p.id} performance={p} actions={actionsByPerformanceId.get(p.id) ?? []} />
        ))}
        {performances.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nog geen wederkerige prestaties.</p>
        ) : null}
      </div>
      <div className="grid gap-2 rounded-md border border-dashed border-border p-2.5">
        <Input placeholder="Titel (bijv. logo op backboard)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Omschrijving (optioneel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Waargenomen waarde (€, optioneel)"
            value={perceivedValue}
            onChange={(e) => setPerceivedValue(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            disabled={pending || !title.trim()}
            onClick={() =>
              startTransition(async () => {
                try {
                  await addReciprocalPerformance(
                    packageId,
                    title,
                    description || null,
                    perceivedValue ? Number(perceivedValue) : null,
                  );
                  setTitle("");
                  setDescription("");
                  setPerceivedValue("");
                } catch {
                  toast.error("Toevoegen is mislukt.");
                }
              })
            }
          >
            <Plus className="size-3.5" /> Toevoegen
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EventPackageDetailDialog({
  packageId,
  packageName,
  prices,
  performances,
  actionsByPerformanceId,
}: {
  packageId: string;
  packageName: string;
  prices: PriceRow[];
  performances: PerformanceRow[];
  actionsByPerformanceId: Map<string, ActionRow[]>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <SlidersHorizontal className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{packageName} — prijzen & wederkerige prestaties</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <PriceHistorySection packageId={packageId} prices={prices} />
          <ReciprocalPerformancesSection
            packageId={packageId}
            performances={performances}
            actionsByPerformanceId={actionsByPerformanceId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
