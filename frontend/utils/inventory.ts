/**
 * NEXTCART — Inventory helpers.
 *
 * The backend will store inventory as:
 *   quantity      — physical units in the warehouse
 *   reserved_qty  — units already committed to in-flight orders
 *   available     — quantity - reserved_qty  (the only number the UI cares about)
 *
 * Until the backend exposes a dedicated endpoint, mock data falls back to a
 * simple "stock" integer. These helpers normalise both shapes into a single
 * InventoryState so the UI never has to branch on which shape it received.
 *
 * IMPORTANT: This module is the ONLY place that decides whether a product is
 * sellable. Cart / Buy Now buttons should call canPurchase(state) rather than
 * doing their own stock check.
 */

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryState {
  /** Net sellable units (quantity - reserved_qty). */
  available: number;
  /** Raw physical units in the warehouse (for backend compatibility). */
  quantity: number;
  /** Units committed to other in-flight orders. */
  reservedQty: number;
  /** Convenience status flag — the UI should rely on this, not raw numbers. */
  status: InventoryStatus;
}

const LOW_STOCK_THRESHOLD = 5;

/**
 * Build an InventoryState from the backend payload. Accepts either the
 * backend-shaped object (quantity/reservedQty + optional stockStatus) or
 * the legacy flat "stock" integer used by the current mock data — both
 * produce the same UI result.
 *
 * When the backend provides a `stockStatus` (e.g. "IN_STOCK",
 * "LOW_STOCK", "OUT_OF_STOCK") it takes precedence over the local
 * threshold-based derivation. The numeric fields are still emitted so the
 * "Only N left" label keeps working when the backend marks something as
 * LOW_STOCK without an explicit count.
 */
export function deriveInventory(
  input:
    | {
        quantity?: number;
        reservedQty?: number;
        available?: number;
        stockStatus?: string;
      }
    | number
    | null
    | undefined,
): InventoryState {
  // Legacy path: pass the flat "stock" integer.
  if (typeof input === "number" || input === null || input === undefined) {
    const quantity = Number(input ?? 0);
    const reservedQty = 0;
    const available = Math.max(0, quantity - reservedQty);
    return {
      quantity,
      reservedQty,
      available,
      status: statusFor(available),
    };
  }

  const quantity = Number(input.quantity ?? 0);
  const reservedQty = Number(input.reservedQty ?? 0);

  // Backend may pre-compute "available". Trust it when present, otherwise
  // recompute so we never sell reserved units.
  const rawAvailable = input.available;
  const available =
    typeof rawAvailable === "number"
      ? Math.max(0, rawAvailable)
      : Math.max(0, quantity - reservedQty);

  return {
    quantity,
    reservedQty,
    available,
    status: stockStatusToInventoryStatus(input.stockStatus) ?? statusFor(available),
  };
}

/**
 * Map the backend's `stockStatus` enum to our local InventoryStatus.
 * Returns undefined when the input is missing or unrecognised so the
 * caller can fall back to the numeric derivation.
 */
function stockStatusToInventoryStatus(
  raw: string | undefined,
): InventoryStatus | undefined {
  if (!raw) return undefined;
  switch (String(raw).toUpperCase()) {
    case "IN_STOCK":
    case "AVAILABLE":
      return "in_stock";
    case "LOW_STOCK":
      return "low_stock";
    case "OUT_OF_STOCK":
    case "SOLD_OUT":
      return "out_of_stock";
    default:
      return undefined;
  }
}

function statusFor(available: number): InventoryStatus {
  if (available <= 0) return "out_of_stock";
  if (available <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

/** True when the product/variant can be added to cart right now. */
export function canPurchase(state: InventoryState): boolean {
  return state.status !== "out_of_stock";
}

/**
 * Clamp a user-selected quantity against the available stock. The UI should
 * use this when the user picks a quantity rather than blindly letting them
 * select any number.
 */
export function clampQuantity(
  requested: number,
  state: InventoryState,
  min = 1,
): number {
  if (!Number.isFinite(requested)) return min;
  const lower = Math.max(min, Math.floor(requested));
  if (state.status === "out_of_stock") return min;
  return Math.min(lower, state.available);
}

/**
 * Human-readable stock label. Returns short copy suitable for inline use
 * ("In stock", "Only 3 left", "Out of stock").
 */
export function stockLabel(state: InventoryState): string {
  if (state.status === "out_of_stock") return "Out of stock";
  if (state.status === "low_stock") {
    return `Only ${state.available} left`;
  }
  return "In stock";
}
