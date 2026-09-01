/**
 * NEXTCART — Cart service boundary.
 *
 * Wraps Spring Boot's cart module. The backend is the authoritative
 * source for cart contents and totals. Every mutation returns the
 * fresh `CartResponseDTO`; the store overwrites its local items with
 * whatever the server says.
 *
 * Wire shape notes:
 *   - `price`, `itemTotal`, `grandTotal` are BigDecimal on the server,
 *     which serialises as a JSON string (e.g. "69999.00"). We coerce
 *     to number on the way in so the UI can keep using arithmetic.
 *   - Adding a line REQUIRES `variantId` (backend `@NotNull`); the
 *     server resolves the line by variant and derives the product from
 *     it. Update/remove target `/cart/items/{id}` where `{id}` is the
 *     VARIANT id (the controller's path var is misleadingly named
 *     `productId` but is passed straight to a `findByProductVariantId`
 *     lookup). We therefore send the variantId on every mutation.
 *   - The response `CartItemResponseDTO` does NOT echo the variantId
 *     back and `productImage` is always null — the store retains the
 *     variantId it sent so later mutations can address the line.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types
   ───────────────────────────────────────────────────────────────────── */

export interface CartItemWire {
  id: number;
  productId: number;
  productName: string;
  productImage?: string | null;
  /** Backend serialises BigDecimal as a JSON string. */
  price: number;
  quantity: number;
  /** Backend-computed per-line total (price * quantity). */
  itemTotal: number;
}

export interface CartResponseWire {
  id?: number | null;
  userId?: number | null;
  sessionId?: string | null;
  items: CartItemWire[];
  totalItems: number;
  /** Backend-computed grand total. */
  grandTotal: number;
}

/* ─────────────────────────────────────────────────────────────────────
   BigDecimal coercion
   ───────────────────────────────────────────────────────────────────── */

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normaliseItem(raw: CartItemWire): CartItemWire {
  return {
    ...raw,
    price: toNumber(raw.price),
    quantity: typeof raw.quantity === "number" ? raw.quantity : 0,
    itemTotal: toNumber(raw.itemTotal),
  };
}

function normaliseCart(raw: CartResponseWire): CartResponseWire {
  return {
    ...raw,
    items: Array.isArray(raw.items) ? raw.items.map(normaliseItem) : [],
    totalItems: typeof raw.totalItems === "number" ? raw.totalItems : 0,
    grandTotal: toNumber(raw.grandTotal),
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Endpoints
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  cart: "/api/v1/cart",
  addItem: "/api/v1/cart/items",
  updateItem: (cartItemId: number) =>
    `/api/v1/cart/items/${encodeURIComponent(String(cartItemId))}`,
  removeItem: (cartItemId: number) =>
    `/api/v1/cart/items/${encodeURIComponent(String(cartItemId))}`,
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────────── */

/** GET /api/v1/cart */
export async function getCart(
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(ENDPOINTS.cart, {
    method: "GET",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: normaliseCart(res.data) };
}

/** POST /api/v1/cart/items — add a variant to the cart.
 *  Backend requires BOTH productId and variantId (@NotNull). */
export async function addItemToCart(
  productId: number,
  variantId: number,
  quantity: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(ENDPOINTS.addItem, {
    method: "POST",
    body: { productId, variantId, quantity },
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: normaliseCart(res.data) };
}

/** PUT /api/v1/cart/items/{cartItemId} — set quantity. */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.updateItem(cartItemId),
    { method: "PUT", body: { quantity }, signal },
  );
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: normaliseCart(res.data) };
}

/** DELETE /api/v1/cart/items/{cartItemId} */
export async function removeCartItem(
  cartItemId: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.removeItem(cartItemId),
    { method: "DELETE", signal },
  );
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: normaliseCart(res.data) };
}

/** DELETE /api/v1/cart */
export async function clearServerCart(
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<unknown>(ENDPOINTS.cart, {
    method: "DELETE",
    signal,
  });
  if (!res.ok) return res;
  // Server returns 204 No Content; we don't care about the body.
  return { ok: true, status: res.status, data: true };
}

export type { ApiResult };
