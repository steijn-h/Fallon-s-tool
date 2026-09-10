import { format } from "date-fns";
import { nl } from "date-fns/locale";

import type { ProfileEventRole, ProfileStatus, TaskStatus } from "@/lib/supabase/database.types";

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  lead: "Lead",
  prospect: "Potentiële sponsor",
  sponsor: "Sponsor",
  inactive: "Inactief",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "Mee bezig",
  done: "Afgerond",
};

export const PROFILE_EVENT_ROLE_LABELS: Record<ProfileEventRole, string> = {
  lead: "Lead",
  sponsor: "Sponsor",
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "d MMM yyyy", { locale: nl });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "d MMM yyyy HH:mm", { locale: nl });
}
