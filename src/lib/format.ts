import { format } from "date-fns";
import { nl } from "date-fns/locale";

import type { Sponsorship } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function currency(value: number): string {
  return currencyFormatter.format(value);
}

export function compactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "d MMM yyyy", { locale: nl });
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "d-M-yyyy", { locale: nl });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "d MMM yyyy HH:mm", { locale: nl });
}

/** Days from now until `value` — negative when the date is in the past. */
export function relativeDays(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = new Date(value);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / msPerDay);
}

export function durationYears(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 365.25));
}

/**
 * Renewal rate for a given calendar year: renewed = sponsorships with
 * renewedFromId created that year; expired = sponsorships that ended that
 * year and are now completed/cancelled. rate = renewed / expired * 100.
 */
export function computeRenewalRate(sponsorships: Sponsorship[], year: number): number {
  const renewed = sponsorships.filter(
    (s) => s.renewedFromId !== null && new Date(s.createdAt).getFullYear() === year,
  ).length;
  const expired = sponsorships.filter(
    (s) =>
      (s.status === "completed" || s.status === "cancelled") &&
      new Date(s.endDate).getFullYear() === year,
  ).length;
  if (expired === 0) return 0;
  return Math.round((renewed / expired) * 1000) / 10;
}
