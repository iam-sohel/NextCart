/**
 * HAVLOOK — Cart service boundary.
 *
 * Backend is the authoritative source for cart contents,
 * prices, discounts and totals.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — matches Spring Boot CartResponseDTO
   ───────────────────────────────────────────────────────────────────── */

export interface CartItemWire {
  id: number;
  productId: number;
  productVariantId: number;

  productName: string;
  productImage?: string | null;

  /** Backend unit price. */
  unitPrice: number;

  quantity: number;

  /** Backend-computed line total. */
  lineTotal: number;
}

export interface CartResponseWire {
  id?: number | null;
  userId?: number | null;
  sessionId?: string | null;

  items: CartItemWire[];

  totalItems: number;

  /** Total product/MRP price before discount. */
  productPrice: number;

  /** Total discount applied. */
  totalDiscount: number;

  /** Final payable cart total. */
  orderTotal: number;
}

/* ─────────────────────────────────────────────────────────────────────
   Number coercion
   ───────────────────────────────────────────────────────────────────── */

function toNumber(v: unknown): number {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0;
  }

  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  return 0;
}

interface BackendCartEnvelope {
  success?: boolean;
  message?: string;
  data?: CartResponseWire | null;
}

function unwrapCartResponse(
  payload: BackendCartEnvelope | CartResponseWire,
): CartResponseWire {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object"
  ) {
    return payload.data;
  }

  return payload as CartResponseWire;
}

function normaliseItem(raw: CartItemWire): CartItemWire {
  return {
    ...raw,

    id: toNumber(raw.id),
    productId: toNumber(raw.productId),
    productVariantId: toNumber(raw.productVariantId),

    unitPrice: toNumber(raw.unitPrice),

    quantity:
      typeof raw.quantity === "number"
        ? raw.quantity
        : toNumber(raw.quantity),

    lineTotal: toNumber(raw.lineTotal),
  };
}

function normaliseCart(raw: CartResponseWire): CartResponseWire {
  return {
    ...raw,

    items: Array.isArray(raw.items)
      ? raw.items.map(normaliseItem)
      : [],

    totalItems:
      typeof raw.totalItems === "number"
        ? raw.totalItems
        : toNumber(raw.totalItems),

    productPrice: toNumber(raw.productPrice),

    totalDiscount: toNumber(raw.totalDiscount),

    orderTotal: toNumber(raw.orderTotal),
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
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.cart,
    {
      method: "GET",
      signal,
    },
  );

  if (!res.ok) {
    return res;
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseCart(unwrapCartResponse(res.data)),
  };
}

/**
 * POST /api/v1/cart/items
 *
 * Backend contract (CartItemAddRequestDTO):
 *   productVariantId
 *   quantity
 *
 * `productId` is intentionally NOT sent — the backend DTO does not declare
 * it. Callers keep the product ID locally for UI metadata only.
 */
export async function addItemToCart(
  variantId: number,
  quantity: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.addItem,
    {
      method: "POST",

      body: {
        productVariantId: variantId,
        quantity,
      },

      signal,
    },
  );

  if (!res.ok) {
    return res;
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseCart(unwrapCartResponse(res.data)),
  };
}

/** PUT /api/v1/cart/items/{cartItemId} */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.updateItem(cartItemId),
    {
      method: "PUT",
      body: { quantity },
      signal,
    },
  );

  if (!res.ok) {
    return res;
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseCart(unwrapCartResponse(res.data)),
  };
}

/** DELETE /api/v1/cart/items/{cartItemId} */
export async function removeCartItem(
  cartItemId: number,
  signal?: AbortSignal,
): Promise<ApiResult<CartResponseWire>> {
  const res = await apiRequest<CartResponseWire>(
    ENDPOINTS.removeItem(cartItemId),
    {
      method: "DELETE",
      signal,
    },
  );

  if (!res.ok) {
    return res;
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseCart(unwrapCartResponse(res.data)),
  };
}

/** DELETE /api/v1/cart */
export async function clearServerCart(
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<unknown>(
    ENDPOINTS.cart,
    {
      method: "DELETE",
      signal,
    },
  );

  if (!res.ok) {
    return res;
  }

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}

export type { ApiResult };