/**
 * NEXTCART — Seller earning service boundary.
 *
 * Uses the read-only seller earning endpoints:
 *   GET /api/v1/sellers/earnings
 *   GET /api/v1/sellers/earnings/summary
 *   GET /api/v1/sellers/payments/{earningId}
 *   GET /api/v1/sellers/payments/order/{orderId}
 *
 * `/payments` and `/earnings` return the same records. This service uses the
 * earnings routes whenever they cover the requested operation. Amounts are
 * never calculated on the client.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type SellerEarningStatus =
  | "PENDING"
  | "AVAILABLE"
  | "PAID"
  | "REFUNDED";

export const SELLER_EARNING_STATUSES: SellerEarningStatus[] = [
  "PENDING",
  "AVAILABLE",
  "PAID",
  "REFUNDED",
];

export interface SellerEarning {
  id: number;
  sellerId: number | null;
  orderId: number | null;
  orderNumber: string | null;
  orderItemId: number | null;
  productId: number | null;
  productVariantId: number | null;
  productName: string | null;
  sku: string | null;
  quantity: number | null;
  grossAmount: number | null;
  commissionAmount: number | null;
  netAmount: number | null;
  status: SellerEarningStatus;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SellerEarningSummary {
  sellerId: number | null;
  totalGrossAmount: number | null;
  totalCommissionAmount: number | null;
  totalNetAmount: number | null;
  pendingAmount: number | null;
  availableAmount: number | null;
  paidAmount: number | null;
  refundedAmount: number | null;
  totalEarningRecords: number | null;
  pendingRecords: number | null;
  availableRecords: number | null;
  paidRecords: number | null;
  refundedRecords: number | null;
}

export interface SellerEarningPage {
  content: SellerEarning[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type SellerEarningSort = "createdAt,desc" | "createdAt,asc";

export interface SellerEarningPageQuery {
  page?: number;
  size?: number;
  sort?: SellerEarningSort;
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

function normaliseEarning(earning: SellerEarning): SellerEarning | null {
  if (
    !earning ||
    typeof earning !== "object" ||
    !Number.isInteger(earning.id) ||
    earning.id <= 0 ||
    !(SELLER_EARNING_STATUSES as string[]).includes(String(earning.status))
  ) {
    return null;
  }

  return {
    id: earning.id,
    sellerId: toCount(earning.sellerId),
    orderId: toCount(earning.orderId),
    orderNumber: toText(earning.orderNumber),
    orderItemId: toCount(earning.orderItemId),
    productId: toCount(earning.productId),
    productVariantId: toCount(earning.productVariantId),
    productName: toText(earning.productName),
    sku: toText(earning.sku),
    quantity: toCount(earning.quantity),
    grossAmount: toNumber(earning.grossAmount),
    commissionAmount: toNumber(earning.commissionAmount),
    netAmount: toNumber(earning.netAmount),
    status: earning.status,
    createdAt: toText(earning.createdAt),
    updatedAt: toText(earning.updatedAt),
  };
}

function normalisePage(page: SellerEarningPage | null): SellerEarningPage | null {
  if (!page || typeof page !== "object" || !Array.isArray(page.content)) {
    return null;
  }

  const content = page.content
    .map(normaliseEarning)
    .filter((earning): earning is SellerEarning => earning !== null);

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

function pageQuery(query: SellerEarningPageQuery = {}): string {
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

/** GET /api/v1/sellers/earnings */
export async function listSellerEarnings(
  query: SellerEarningPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerEarningPage>> {
  const res = await apiRequest<Envelope<SellerEarningPage> | SellerEarningPage>(
    `/api/v1/sellers/earnings?${pageQuery(query)}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerEarningPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid earnings list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/sellers/payments/{earningId} */
export async function getSellerEarning(
  earningId: number,
  signal?: AbortSignal,
): Promise<ApiResult<SellerEarning>> {
  if (!Number.isInteger(earningId) || earningId <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Invalid earning ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerEarning> | SellerEarning>(
    `/api/v1/sellers/payments/${earningId}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const earning = normaliseEarning(
    unwrap<SellerEarning | null>(res.data, null) as SellerEarning,
  );

  if (!earning) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid earning.",
    };
  }

  return { ok: true, status: res.status, data: earning };
}

/** GET /api/v1/sellers/payments/order/{orderId} */
export async function listSellerEarningsByOrder(
  orderId: number,
  query: SellerEarningPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerEarningPage>> {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Invalid order ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerEarningPage> | SellerEarningPage>(
    `/api/v1/sellers/payments/order/${orderId}?${pageQuery(query)}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerEarningPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid earnings list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/sellers/earnings/summary */
export async function getSellerEarningsSummary(
  signal?: AbortSignal,
): Promise<ApiResult<SellerEarningSummary>> {
  const res = await apiRequest<
    Envelope<SellerEarningSummary> | SellerEarningSummary
  >("/api/v1/sellers/earnings/summary", { method: "GET", signal });

  if (!res.ok) return res;

  const summary = unwrap<SellerEarningSummary | null>(res.data, null);

  if (!summary || typeof summary !== "object") {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid earnings summary.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: {
      sellerId: toCount(summary.sellerId),
      totalGrossAmount: toNumber(summary.totalGrossAmount),
      totalCommissionAmount: toNumber(summary.totalCommissionAmount),
      totalNetAmount: toNumber(summary.totalNetAmount),
      pendingAmount: toNumber(summary.pendingAmount),
      availableAmount: toNumber(summary.availableAmount),
      paidAmount: toNumber(summary.paidAmount),
      refundedAmount: toNumber(summary.refundedAmount),
      totalEarningRecords: toCount(summary.totalEarningRecords),
      pendingRecords: toCount(summary.pendingRecords),
      availableRecords: toCount(summary.availableRecords),
      paidRecords: toCount(summary.paidRecords),
      refundedRecords: toCount(summary.refundedRecords),
    },
  };
}

export type { ApiResult };
