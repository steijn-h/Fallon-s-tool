import { cn } from "@/lib/utils";
import { STATUS_META, type SponsorshipStatus } from "@/lib/types";

const MAIN_STEPS: SponsorshipStatus[] = ["concept", "contracted", "active", "completed"];

const STATUS_DESCRIPTIONS: Record<SponsorshipStatus, string> = {
  concept: "Eerste afspraken, nog geen getekend contract.",
  contracted: "Contract is getekend, de samenwerking is nog niet gestart.",
  active: "De samenwerking loopt.",
  completed: "De looptijd is afgerond.",
  "at-risk": "Loopt nog, maar er is een signaal dat de samenwerking niet vanzelf wordt verlengd.",
  cancelled: "Voortijdig beëindigd.",
};

/**
 * Visualizes the sponsorship lifecycle as a line of steps
 * (concept → contracted → active → completed). "at-risk" and "cancelled"
 * aren't steps on that line — they're exception states that branch off
 * from "active" — so they're shown as a separate badge instead of forcing
 * them into the sequence.
 */
export function StatusPipeline({ status }: { status: SponsorshipStatus }) {
  const isException = status === "at-risk" || status === "cancelled";
  const activeIndex = isException ? MAIN_STEPS.indexOf("active") : MAIN_STEPS.indexOf(status);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <ol className="flex items-center">
          {MAIN_STEPS.map((step, index) => {
            const isDone = index < activeIndex || (!isException && index === activeIndex);
            const isCurrent = !isException && index === activeIndex;

            return (
              <li key={step} className="flex items-center">
                {index > 0 ? (
                  <span
                    className={cn("h-px w-6", isDone || index <= activeIndex ? "bg-primary" : "bg-border")}
                  />
                ) : null}
                <span
                  title={STATUS_META[step].label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {STATUS_META[step].label}
                </span>
              </li>
            );
          })}
        </ol>
        {isException ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              status === "at-risk"
                ? "border-primary bg-primary/10 text-primary"
                : "border-destructive bg-destructive/10 text-destructive",
            )}
          >
            {STATUS_META[status].label}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {STATUS_META[status].label}: {STATUS_DESCRIPTIONS[status]}
        {!isException ? " · \"Risico\" en \"Geannuleerd\" zijn uitzonderingen die vanuit \"Actief\" kunnen optreden." : ""}
      </p>
    </div>
  );
}
