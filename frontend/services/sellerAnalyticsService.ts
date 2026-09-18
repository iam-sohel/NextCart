/**
 * NEXTCART — Seller analytics service boundary.
 *
 * Consumes the real aggregate endpoint:
 *   GET /api/v1/sellers/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Both date parameters are optional. The backend uses the current month when
 * they are omitted. Only documented `from` and `to` parameters are sent.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface SellerAnalyticsOverview {
  totalSales: number | null;
  totalOrders: number | null;
  totalUnitsSold: number | null;
  averageOrderValue: number | null;
}

export interface SellerAnalyticsOrders {
  statusCounts: Record<string, number | null>;
}

export interface SellerAnalyticsProducts {
  totalProducts: number | null;
  activeProducts: number | null;
  inactiveProducts: number | null;
}

export interface SellerAnalyticsInventory {
  totalItems: number | null;
  availableStock: number | null;
  reservedStock: number | null;
  lowStockItems: number | null;
  outOfStockItems: number | null;
}

export interface SellerDailySales {
  date: string | null;
  sales: number | null;
  unitsSold: number | null;
}

export interface SellerTopProduct {
  productId: number | null;
  productName: string | null;
  unitsSold: number | null;
  sales: number | null;
}

export interface SellerAnalyticsResponse {
  sellerId: number | null;
  from: string | null;
  to: string | null;
  overview: SellerAnalyticsOverview | null;
  orders: SellerAnalyticsOrders | null;
  products: SellerAnalyticsProducts | null;
  inventory: SellerAnalyticsInventory | null;
  dailySales: SellerDailySales[];
  topProducts: SellerTopProduct[];
}

export interface SellerAnalyticsQuery {
  from?: string;
  to?: string;
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

function normaliseAnalytics(
  data: SellerAnalyticsResponse | null,
): SellerAnalyticsResponse | null {
  if (!data || typeof data !== "object") return null;

  const statusCounts: Record<string, number | null> = {};
  const rawCounts = data.orders?.statusCounts;
  if (rawCounts && typeof rawCounts === "object") {
    for (const [status, count] of Object.entries(rawCounts)) {
      statusCounts[status] = toCount(count);
    }
  }

  return {
    sellerId: toCount(data.sellerId),
    from: toText(data.from),
    to: toText(data.to),
    overview: data.overview
      ? {
          totalSales: toNumber(data.overview.totalSales),
          totalOrders: toCount(data.overview.totalOrders),
          totalUnitsSold: toCount(data.overview.totalUnitsSold),
          averageOrderValue: toNumber(data.overview.averageOrderValue),
        }
      : null,
    orders: data.orders ? { statusCounts } : null,
    products: data.products
      ? {
          totalProducts: toCount(data.products.totalProducts),
          activeProducts: toCount(data.products.activeProducts),
          inactiveProducts: toCount(data.products.inactiveProducts),
        }
      : null,
    inventory: data.inventory
      ? {
          totalItems: toCount(data.inventory.totalItems),
          availableStock: toCount(data.inventory.availableStock),
          reservedStock: toCount(data.inventory.reservedStock),
          lowStockItems: toCount(data.inventory.lowStockItems),
          outOfStockItems: toCount(data.inventory.outOfStockItems),
        }
      : null,
    dailySales: Array.isArray(data.dailySales)
      ? data.dailySales.map((entry) => ({
          date: toText(entry?.date),
          sales: toNumber(entry?.sales),
          unitsSold: toCount(entry?.unitsSold),
        }))
      : [],
    topProducts: Array.isArray(data.topProducts)
      ? data.topProducts.map((product) => ({
          productId: toCount(product?.productId),
          productName: toText(product?.productName),
          unitsSold: toCount(product?.unitsSold),
          sales: toNumber(product?.sales),
        }))
      : [],
  };
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/**
 * GET /api/v1/sellers/analytics
 *
 * The page validates the local date range before calling. This service sends
 * only valid ISO dates actually supplied by the caller. Omitting `from` or
 * `to` preserves the backend's month-to-date default.
 */
export async function getSellerAnalytics(
  query: SellerAnalyticsQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerAnalyticsResponse>> {
  const params = new URLSearchParams();

  if (query.from && isValidDate(query.from)) params.set("from", query.from);
  if (query.to && isValidDate(query.to)) params.set("to", query.to);

  const path =
    params.size > 0
      ? `/api/v1/sellers/analytics?${params.toString()}`
      : "/api/v1/sellers/analytics";

  const res = await apiRequest<
    Envelope<SellerAnalyticsResponse> | SellerAnalyticsResponse
  >(path, { method: "GET", signal });

  if (!res.ok) return res;

  const analytics = normaliseAnalytics(
    unwrap<SellerAnalyticsResponse | null>(res.data, null),
  );

  if (!analytics) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid analytics response.",
    };
  }

  return { ok: true, status: res.status, data: analytics };
}

export type { ApiResult };
