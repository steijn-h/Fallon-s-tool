import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function TargetBar({
  label,
  currentLabel,
  targetLabel,
  percentage,
}: {
  label: string;
  currentLabel: string;
  targetLabel: string;
  percentage: number;
}) {
  const achieved = percentage >= 100;
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn("text-xs", achieved ? "font-medium text-success" : "text-muted-foreground")}>
          {achieved ? "Doel behaald" : `${currentLabel} van ${targetLabel}`}
        </span>
      </div>
      <Progress value={clamped} indicatorClassName={achieved ? "bg-success" : undefined} />
    </div>
  );
}
