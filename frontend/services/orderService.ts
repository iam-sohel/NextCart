/**
 * NEXTCART — Order service boundary.
 *
 * Mirrors the Spring Boot order module contract.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface OrderItemWire {
  id: number;
  productVariantId: number;
  productName: string;
  sku?: string | null;
  quantity: number;
  unitMrp?: number | string | null;
  unitSellingPrice?: number | string | null;
  discountAmount?: number | string | null;
  lineTotal?: number | string | null;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | (string & {});

export interface OrderResponseWire {
  id: number;
  orderNumber: string;
  status: OrderStatus;

  paymentExpiresAt?: string | null;

  shippingFullName?: string | null;
  shippingPhoneNumber?: string | null;
  shippingStreetAddress?: string | null;
  shippingLandmark?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;

  subtotal?: number | string | null;
  discountAmount?: number | string | null;
  shippingCharge?: number | string | null;
  taxAmount?: number | string | null;
  totalAmount?: number | string | null;
  currency?: string | null;

  items: OrderItemWire[];

  createdAt?: string | null;
  updatedAt?: string | null;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

interface PageWire<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

function unwrap<T>(payload: unknown): T | null {
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as Envelope<T>;
    return envelope.data ?? null;
  }

  return (payload as T) ?? null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normaliseOrder(order: OrderResponseWire): OrderResponseWire {
  return {
    ...order,

    subtotal: toNumber(order.subtotal),
    discountAmount: toNumber(order.discountAmount),
    shippingCharge: toNumber(order.shippingCharge),
    taxAmount: toNumber(order.taxAmount),
    totalAmount: toNumber(order.totalAmount),

    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          unitMrp: toNumber(item.unitMrp),
          unitSellingPrice: toNumber(item.unitSellingPrice),
          discountAmount: toNumber(item.discountAmount),
          lineTotal: toNumber(item.lineTotal),
          quantity: Number(item.quantity) || 0,
        }))
      : [],
  };
}

const ENDPOINTS = {
  create: "/api/orders",
  list: "/api/orders/my",
  byId: (id: number) => `/api/orders/${id}`,
  byNumber: (orderNumber: string) =>
    `/api/orders/number/${encodeURIComponent(orderNumber)}`,
  byStatus: (status: OrderStatus) =>
    `/api/orders/my/status/${encodeURIComponent(status)}`,
  cancel: (id: number) => `/api/orders/${id}/cancel`,
} as const;

/**
 * Creates an order from the authenticated customer's current cart.
 */
export async function checkout(
  addressId: number,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire> | OrderResponseWire
  >(ENDPOINTS.create, {
    method: "POST",
    body: { addressId },
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire>(res.data);

  if (
    !data ||
    typeof data.orderNumber !== "string" ||
    !data.orderNumber.trim()
  ) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid order response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseOrder(data),
  };
}

/**
 * Returns the authenticated customer's order history.
 */
export async function getOrders(
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire[]>> {
  const res = await apiRequest<
    | Envelope<
        PageWire<OrderResponseWire> | OrderResponseWire[]
      >
    | PageWire<OrderResponseWire>
    | OrderResponseWire[]
  >(ENDPOINTS.list, {
    method: "GET",
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<PageWire<OrderResponseWire> | OrderResponseWire[]>(
    res.data,
  );

  const orders = Array.isArray(data) ? data : data?.content;

  if (!Array.isArray(orders)) {
    return {
      ok: false,
      status: res.status,
      message: "Empty or invalid orders response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: orders.map(normaliseOrder),
  };
}

/**
 * Returns one order belonging to the authenticated customer.
 */
export async function getOrderById(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire> | OrderResponseWire
  >(ENDPOINTS.byId(id), {
    method: "GET",
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire>(res.data);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "Order not found.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseOrder(data),
  };
}

/**
 * Returns one order by its server-generated order number.
 */
export async function getOrderByNumber(
  orderNumber: string,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire> | OrderResponseWire
  >(ENDPOINTS.byNumber(orderNumber), {
    method: "GET",
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire>(res.data);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "Order not found.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseOrder(data),
  };
}

/**
 * Cancels an eligible customer order.
 */
export async function cancelOrder(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<OrderResponseWire>> {
  const res = await apiRequest<
    Envelope<OrderResponseWire> | OrderResponseWire
  >(ENDPOINTS.cancel(id), {
    method: "PATCH",
    signal,
  });

  if (!res.ok) return res;

  const data = unwrap<OrderResponseWire>(res.data);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid cancellation response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: normaliseOrder(data),
  };
}

export type { ApiResult };