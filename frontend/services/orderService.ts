/**
 * NEXTCART — Order service boundary.
 *
 * Wraps Spring Boot's order module.
 * Checkout is the order-creation mutation.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* --------------------------------------------------------------------------
   Wire types — match backend OrderResponseDTO
   -------------------------------------------------------------------------- */

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
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | (string & {});

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
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
    const envelope = payload as Envelope<T>;

    if (envelope.data !== undefined && envelope.data !== null) {
      return envelope.data;
    }
  }

  return fallback;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  return 0;
}

function normaliseOrder(order: OrderResponseWire): OrderResponseWire {
  return {
    ...order,
    totalAmount: toNumber(order.totalAmount),

    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          price: toNumber(item.price),
          quantity:
            typeof item.quantity === "number" ? item.quantity : 0,
          itemTotal: toNumber(item.itemTotal),
        }))
      : [],
  };
}

/* --------------------------------------------------------------------------
   Endpoints
   -------------------------------------------------------------------------- */

const ENDPOINTS = {
  checkout: "/api/v1/orders/checkout",
  checkoutPreview: "/api/v1/checkout",
  list: "/api/v1/orders",
  byId: (id: number) => `/api/v1/orders/${id}`,
  cancel: (id: number) => `/api/v1/orders/${id}/cancel`,
} as const;

/* --------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

/**
 * POST /api/v1/orders/checkout
 *
 * Creates an order from the user's current cart.
 *
 * Body:
 * {
 *   addressId: number,
 *   paymentMethod: string
 * }
 *
 * Server returns:
 * ApiResponse<OrderResponseDTO>
 */
export async function checkout(
  addressId: number,
  paymentMethod: string,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire> | OrderResponseWire
  >(ENDPOINTS.checkout, {
    method: "POST",
    body: {
      addressId,
      paymentMethod,
    },
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire | null>(res.data, null);

  if (
    !data ||
    typeof data.orderNumber !== "string" ||
    !data.orderNumber.trim()
  ) {
    return {
      ok: false,
      status: res.status,
      message:
        "Order was created but the server returned an invalid order response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseOrder(data),
  };
}

/**
 * GET /api/v1/orders
 *
 * Returns the authenticated user's order history.
 */
export async function getOrders(
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire[]>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire[]> | OrderResponseWire[]
  >(ENDPOINTS.list, {
    method: "GET",
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire[] | null>(res.data, null);

  if (!Array.isArray(data)) {
    return {
      ok: false,
      status: res.status,
      message: "Empty or invalid orders response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: data.map(normaliseOrder),
  };
}

export type { ApiResult };