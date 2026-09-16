import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "destructive";
}) {
  return (
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
        <div className="rounded-md bg-secondary p-2 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
