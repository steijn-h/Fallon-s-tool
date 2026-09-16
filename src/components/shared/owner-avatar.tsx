import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { Owner } from "@/lib/types";

export const UNKNOWN_OWNER: Pick<Owner, "name" | "initials" | "color"> = {
  name: "Onbekend",
  initials: "?",
  color: "271 14% 60%",
};

export function findOwner(owners: Owner[], id: string | null | undefined): Owner | typeof UNKNOWN_OWNER {
  if (!id) return UNKNOWN_OWNER;
  return owners.find((o) => o.id === id) ?? UNKNOWN_OWNER;
}

export function OwnerAvatar({
  owner,
  size = "md",
  showName = false,
}: {
  owner: Pick<Owner, "name" | "initials" | "color">;
  size?: "sm" | "md";
  showName?: boolean;
}) {
  const style = { "--avatar-color": owner.color } as CSSProperties;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        style={style}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          "bg-[hsl(var(--avatar-color))]",
          size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs",
        )}
      >
        {owner.initials}
      </span>
      {showName ? <span className="text-sm">{owner.name}</span> : null}
    </span>
  );
}
