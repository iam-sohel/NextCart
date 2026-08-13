/**
 * NEXTCART — Centralised currency formatting.
 *
 * Why this exists:
 *   - The backend will eventually return numeric prices in paise (or rupees)
 *     and we should NEVER sprinkle `₹{x.toLocaleString()}` across the
 *     codebase. Doing so produces wrong group separators on some locales
 *     and breaks whenever the backend changes shape.
 *   - One helper means every screen displays the same thing: ₹79,999.
 *   - We pin the locale to "en-IN" explicitly so the output is stable
 *     regardless of the user's browser/OS locale (which is what caused
 *     the "₹79.999" / "â‚¹79,999" regressions in earlier code).
 *
 * Rules:
 *   - Always pass a NUMBER. Strings are coerced via Number() but warned.
 *   - Never concatenate the result into another formatter. The helper
 *     already adds the symbol — just render it as a string.
 *   - Do NOT use this for percentage, dates, or non-INR currencies. Add
 *     a sibling helper if those needs arise.
 */

const INR_LOCALE = "en-IN";

/**
 * Format a numeric amount as Indian Rupees with the rupee symbol prefix.
 *
 * Examples:
 *   formatPrice(79999)      -> "₹79,999"
 *   formatPrice(1234567)    -> "₹12,34,567"  (Indian lakh grouping)
 *   formatPrice(0)          -> "₹0"
 *   formatPrice(null)       -> "₹—"
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "₹—";
  }

  const safe = Number(amount);
  if (!Number.isFinite(safe)) return "₹—";

  // Indian numbering system uses lakh/crore grouping (2-3-3-3-...). The
  // "en-IN" locale respects this automatically, unlike "en-US" which
  // produces the wrong "₹1,234,567" grouping for Indian users.
  return `₹${safe.toLocaleString(INR_LOCALE, {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Compute the displayed discount percentage between an original and a sale
 * price. Returns 0 when the values are invalid or when there's no discount.
 *
 * The result is rounded to the nearest integer — this matches how we display
 * discounts on product cards ("11% OFF") and avoids fractional noise.
 */
export function computeDiscountPercent(
  originalPrice: number | null | undefined,
  salePrice: number | null | undefined,
): number {
  if (
    originalPrice === null ||
    originalPrice === undefined ||
    salePrice === null ||
    salePrice === undefined
  ) {
    return 0;
  }

  const original = Number(originalPrice);
  const sale = Number(salePrice);

  if (
    !Number.isFinite(original) ||
    !Number.isFinite(sale) ||
    original <= 0 ||
    sale >= original
  ) {
    return 0;
  }

  return Math.round(((original - sale) / original) * 100);
}

/**
 * Format an integer discount percentage as "N% OFF". Negative or non-finite
 * inputs are clamped to 0 so the UI never shows "-5% OFF".
 */
export function formatDiscountPercent(discount: number | null | undefined): string {
  const safe = Number(discount);
  if (!Number.isFinite(safe) || safe <= 0) return "0% OFF";
  return `${Math.round(safe)}% OFF`;
}
