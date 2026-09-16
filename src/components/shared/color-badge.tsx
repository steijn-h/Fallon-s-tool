import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/** A pill badge tinted with an arbitrary HSL triplet (e.g. tier/status colors). */
export function ColorBadge({
  label,
  color,
  className,
}: {
  label: string;
  color: string;
  className?: string;
}) {
  const style = {
    "--badge-color": color,
  } as CSSProperties;

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        "border-[hsl(var(--badge-color)/0.3)] bg-[hsl(var(--badge-color)/0.12)] text-[hsl(var(--badge-color))]",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-[hsl(var(--badge-color))]" />
      {label}
    </span>
  );
}
