const OWNER_COLORS = ["25 95% 53%", "271 70% 48%", "0 72% 51%", "275 45% 62%", "152 56% 42%", "225 70% 55%"];

export function initialsForOwnerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function randomOwnerColor(): string {
  return OWNER_COLORS[Math.floor(Math.random() * OWNER_COLORS.length)]!;
}
