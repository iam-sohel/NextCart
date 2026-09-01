/**
 * NEXTCART — Order service boundary.
 *
 * Wraps Spring Boot's order module. The checkout endpoint is the only
 * mutation needed for this checkpoint; list/get/cancel are exposed for
 * future My Orders / tracking pages.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — match OrderResponseDTO
   ───────────────────────────────────────────────────────────────────── */

export interface OrderItemWire {
  id: number;
  productId: number;
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  itemTotal: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | (string & {});

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | (string & {});

export interface OrderResponseWire {
  id: number;
  orderNumber: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  totalAmount: number;
  shippingFullName?: string;
  shippingStreetAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  items: OrderItemWire[];
  createdAt?: string;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

function unwrap<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const e = payload as Envelope<T>;
    if (e.data !== undefined && e.data !== null) return e.data;
  }
  return fallback;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normaliseOrder(o: OrderResponseWire): OrderResponseWire {
  return {
    ...o,
    totalAmount: toNumber(o.totalAmount),
    items: Array.isArray(o.items)
      ? o.items.map((i) => ({
          ...i,
          price: toNumber(i.price),
          quantity: typeof i.quantity === "number" ? i.quantity : 0,
          itemTotal: toNumber(i.itemTotal),
        }))
      : [],
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Endpoints
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  checkout: "/api/v1/checkout",
  list: "/api/orders",
  byId: (id: number) => `/api/orders/${id}`,
  cancel: (id: number) => `/api/orders/${id}/cancel`,
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────────── */

/**
 * POST /api/v1/orders/checkout
 *
 * Body: { addressId, paymentMethod }
 * Server returns an `ApiResponse<OrderResponseDTO>` envelope; we unwrap.
 */
export async function checkout(
  addressId: number,
  paymentMethod: string,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<Envelope<OrderResponseWire> | OrderResponseWire>(
    ENDPOINTS.checkout,
    { method: "POST", body: { addressId, paymentMethod }, signal },
  );
  if (!res.ok) return res;
  const data = unwrap<OrderResponseWire | null>(res.data, null);
  if (!data || typeof data.orderNumber !== "string") {
    return {
      ok: false,
      status: res.status,
      message: "Empty or invalid order response.",
    };
  }
  return { ok: true, status: res.status, data: normaliseOrder(data) };
}

/**
 * GET /api/v1/orders
 *
 * Returns the authenticated user's order history.
 */
export async function getOrders(
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire[]>> {
  const res = await apiRequest<Envelope<OrderResponseWire[]> | OrderResponseWire[]>(
    ENDPOINTS.list,
    { method: "GET", signal },
  );
  if (!res.ok) return res;
  const data = unwrap<OrderResponseWire[] | null>(res.data, null);
  if (!Array.isArray(data)) {
    return {
      ok: false,
      status: res.status,
      message: "Empty or invalid orders response.",
    };
  }
  return { ok: true, status: res.status, data: data.map(normaliseOrder) };
}

export type { ApiResult };
