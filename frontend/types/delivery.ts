/**
 * NEXTCART — Delivery / pincode types.
 *
 * The backend will eventually expose an endpoint similar to:
 *   GET /api/delivery/check?pincode=110001&productId=…
 *
 * Until that ships we model the optimistic response shape so the UI is
 * already wired against it.
 */

export type PincodeCheckStatus = "serviceable" | "unserviceable" | "unknown";

export interface PincodeCheckResult {
  pincode: string;
  status: PincodeCheckStatus;
  /** Estimated delivery date string (backend-formatted). */
  estimatedDelivery?: string;
  /** Whether delivery is free for this product/pincode combination. */
  freeDelivery?: boolean;
  /** Optional human-readable message ("Delivers in 2 days", etc.). */
  message?: string;
}

/**
 * Validate that a string looks like an Indian pincode (6 digits, first digit 1-9).
 * Frontend validation only — the backend must re-validate.
 */
export function isValidIndianPincode(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{6}$/.test(trimmed)) return false;
  const firstDigit = Number(trimmed.charAt(0));
  return firstDigit >= 1 && firstDigit <= 9;
}
