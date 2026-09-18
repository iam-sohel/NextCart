/**
 * NEXTCART — Seller order service boundary.
 *
 * Uses the read-only seller order endpoints:
 *   GET /api/v1/sellers/orders
 *   GET /api/v1/sellers/orders/{orderId}
 *   GET /api/v1/sellers/orders/status/{status}
 *
 * Status filtering is server-side through the exact `OrderStatus` path value.
 * Pagination uses only standard Spring `page`, `size` and `sort` parameters.
 * There is no seller order status-update endpoint, so this service never
 * exposes order mutations.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type SellerOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURN_APPROVED"
  | "RETURNED"
  | "REFUNDED";

export const SELLER_ORDER_STATUSES: SellerOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURNED",
  "REFUNDED",
];

export interface SellerOrderItem {
  id: number | null;
  productVariantId: number | null;
  productName: string | null;
  sku: string | null;
  quantity: number | null;
  unitMrp: number | null;
  unitSellingPrice: number | null;
  discountAmount: number | null;
  lineTotal: number | null;
}

export interface SellerOrder {
  id: number;
  orderNumber: string;
  status: SellerOrderStatus;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paymentExpiresAt: string | null;
  shippingFullName: string | null;
  shippingPhoneNumber: string | null;
  shippingStreetAddress: string | null;
  shippingLandmark: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: number | null;
  discountAmount: number | null;
  shippingCharge: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  currency: string | null;
  items: SellerOrderItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SellerOrderPage {
  content: SellerOrder[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type SellerOrderSort = "createdAt,desc" | "createdAt,asc";

export interface SellerOrderPageQuery {
  page?: number;
  size?: number;
  sort?: SellerOrderSort;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
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

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function toCount(value: unknown): number | null {
  const amount = toNumber(value);
  if (amount === null || amount < 0 || !Number.isInteger(amount)) return null;
  return amount;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text : null;
}

function isSellerOrderStatus(value: unknown): value is SellerOrderStatus {
  return (
    typeof value === "string" &&
    (SELLER_ORDER_STATUSES as string[]).includes(value)
  );
}

function normaliseItem(item: SellerOrderItem): SellerOrderItem {
  return {
    id: toCount(item?.id),
    productVariantId: toCount(item?.productVariantId),
    productName: toText(item?.productName),
    sku: toText(item?.sku),
    quantity: toCount(item?.quantity),
    unitMrp: toNumber(item?.unitMrp),
    unitSellingPrice: toNumber(item?.unitSellingPrice),
    discountAmount: toNumber(item?.discountAmount),
    lineTotal: toNumber(item?.lineTotal),
  };
}

function normaliseOrder(order: SellerOrder): SellerOrder | null {
  if (
    !order ||
    typeof order !== "object" ||
    !Number.isInteger(order.id) ||
    order.id <= 0 ||
    typeof order.orderNumber !== "string" ||
    !order.orderNumber.trim() ||
    !isSellerOrderStatus(order.status)
  ) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: toText(order.paymentMethod),
    paymentStatus: toText(order.paymentStatus),
    paymentExpiresAt: toText(order.paymentExpiresAt),
    shippingFullName: toText(order.shippingFullName),
    shippingPhoneNumber: toText(order.shippingPhoneNumber),
    shippingStreetAddress: toText(order.shippingStreetAddress),
    shippingLandmark: toText(order.shippingLandmark),
    shippingCity: toText(order.shippingCity),
    shippingState: toText(order.shippingState),
    shippingPostalCode: toText(order.shippingPostalCode),
    shippingCountry: toText(order.shippingCountry),
    subtotal: toNumber(order.subtotal),
    discountAmount: toNumber(order.discountAmount),
    shippingCharge: toNumber(order.shippingCharge),
    taxAmount: toNumber(order.taxAmount),
    totalAmount: toNumber(order.totalAmount),
    currency: toText(order.currency),
    items: Array.isArray(order.items)
      ? order.items.map(normaliseItem)
      : [],
    createdAt: toText(order.createdAt),
    updatedAt: toText(order.updatedAt),
  };
}

function normalisePage(page: SellerOrderPage | null): SellerOrderPage | null {
  if (!page || typeof page !== "object" || !Array.isArray(page.content)) {
    return null;
  }

  const content = page.content
    .map(normaliseOrder)
    .filter((order): order is SellerOrder => order !== null);

  return {
    content,
    number: toCount(page.number) ?? 0,
    size: toCount(page.size) ?? content.length,
    totalElements: toCount(page.totalElements) ?? content.length,
    totalPages: toCount(page.totalPages) ?? (content.length > 0 ? 1 : 0),
    first: page.first !== false,
    last: page.last !== false,
  };
}

function pageQuery(query: SellerOrderPageQuery = {}): string {
  const params = new URLSearchParams();
  const page = query.page ?? 0;
  const size = query.size ?? 20;

  params.set("page", Number.isInteger(page) && page >= 0 ? String(page) : "0");
  params.set(
    "size",
    Number.isInteger(size) && size > 0 && size <= 100 ? String(size) : "20",
  );
  params.set("sort", query.sort ?? "createdAt,desc");

  return params.toString();
}

/** GET /api/v1/sellers/orders */
export async function listSellerOrders(
  query: SellerOrderPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerOrderPage>> {
  const res = await apiRequest<Envelope<SellerOrderPage> | SellerOrderPage>(
    `/api/v1/sellers/orders?${pageQuery(query)}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerOrderPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid order list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/sellers/orders/status/{status} */
export async function listSellerOrdersByStatus(
  status: SellerOrderStatus,
  query: SellerOrderPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerOrderPage>> {
  const res = await apiRequest<Envelope<SellerOrderPage> | SellerOrderPage>(
    `/api/v1/sellers/orders/status/${encodeURIComponent(status)}?${pageQuery(query)}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerOrderPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid order list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/sellers/orders/{orderId} */
export async function getSellerOrder(
  orderId: number,
  signal?: AbortSignal,
): Promise<ApiResult<SellerOrder>> {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Invalid order ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerOrder> | SellerOrder>(
    `/api/v1/sellers/orders/${orderId}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const order = normaliseOrder(
    unwrap<SellerOrder | null>(res.data, null) as SellerOrder,
  );

  if (!order) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid order.",
    };
  }

  return { ok: true, status: res.status, data: order };
}

export type { ApiResult };
