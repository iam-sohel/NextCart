/**
 * NEXTCART — Seller-facing number and timestamp presentation helpers.
 *
 * Amount responses do not include a display currency, so monetary values are
 * formatted without inventing one. These helpers only present backend values;
 * business calculations always remain server-side.
 */

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-IN");
}

export function formatAmount(
  value: number | null | undefined,
  fractionDigits = 2,
): string {
  if (value === null || value === undefined) return "—";
  const digits =
    Number.isInteger(fractionDigits) && fractionDigits >= 0
      ? Math.min(fractionDigits, 8)
      : 2;

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
