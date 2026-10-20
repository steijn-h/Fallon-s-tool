import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function CompanyMark({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const style = { "--mark-color": color } as CSSProperties;

  return (
    <span
      style={style}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
        "bg-[hsl(var(--mark-color)/0.15)] text-[hsl(var(--mark-color))]",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
