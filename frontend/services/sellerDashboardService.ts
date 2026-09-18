/**
 * NEXTCART — Seller dashboard service boundary.
 *
 * Consumes the real aggregate endpoint:
 *   GET /api/v1/sellers/dashboard
 *
 * The backend derives the seller from the authenticated JWT. Do not send a
 * seller identifier in the request.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface SellerDashboardSeller {
  sellerId: number | null;
  businessName: string | null;
  verified: boolean;
  active: boolean;
}

export interface SellerDashboardProducts {
  total: number | null;
  active: number | null;
  inactive: number | null;
}

export interface SellerDashboardOrders {
  total: number | null;
  pending: number | null;
  confirmed: number | null;
  processing: number | null;
  shipped: number | null;
  delivered: number | null;
  cancelled: number | null;
  returnRequested: number | null;
  returnApproved: number | null;
  returned: number | null;
  refunded: number | null;
}

export interface SellerDashboardInventory {
  totalItems: number | null;
  lowStockItems: number | null;
  outOfStockItems: number | null;
  availableStock: number | null;
  reservedStock: number | null;
  lowStockThreshold: number | null;
}

export interface SellerDashboardSales {
  totalSalesAmount: number | null;
  deliveredSalesAmount: number | null;
  refundedSalesAmount: number | null;
}

export interface SellerDashboardWarehouses {
  total: number | null;
  active: number | null;
  inactive: number | null;
}

export interface SellerDashboardVerification {
  kycStatus: string | null;
  bankStatus: string | null;
}

export interface SellerDashboardResponse {
  seller: SellerDashboardSeller | null;
  products: SellerDashboardProducts | null;
  orders: SellerDashboardOrders | null;
  inventory: SellerDashboardInventory | null;
  sales: SellerDashboardSales | null;
  warehouses: SellerDashboardWarehouses | null;
  verification: SellerDashboardVerification | null;
  generatedAt: string | null;
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

/** Backend sends counts and BigDecimal money as JSON numbers or strings. */
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

function normaliseDashboard(
  data: SellerDashboardResponse | null,
): SellerDashboardResponse | null {
  if (!data || typeof data !== "object") return null;

  return {
    seller: data.seller
      ? {
          sellerId: toCount(data.seller.sellerId),
          businessName: toText(data.seller.businessName),
          verified: data.seller.verified === true,
          active: data.seller.active === true,
        }
      : null,
    products: data.products
      ? {
          total: toCount(data.products.total),
          active: toCount(data.products.active),
          inactive: toCount(data.products.inactive),
        }
      : null,
    orders: data.orders
      ? {
          total: toCount(data.orders.total),
          pending: toCount(data.orders.pending),
          confirmed: toCount(data.orders.confirmed),
          processing: toCount(data.orders.processing),
          shipped: toCount(data.orders.shipped),
          delivered: toCount(data.orders.delivered),
          cancelled: toCount(data.orders.cancelled),
          returnRequested: toCount(data.orders.returnRequested),
          returnApproved: toCount(data.orders.returnApproved),
          returned: toCount(data.orders.returned),
          refunded: toCount(data.orders.refunded),
        }
      : null,
    inventory: data.inventory
      ? {
          totalItems: toCount(data.inventory.totalItems),
          lowStockItems: toCount(data.inventory.lowStockItems),
          outOfStockItems: toCount(data.inventory.outOfStockItems),
          availableStock: toCount(data.inventory.availableStock),
          reservedStock: toCount(data.inventory.reservedStock),
          lowStockThreshold: toCount(data.inventory.lowStockThreshold),
        }
      : null,
    sales: data.sales
      ? {
          totalSalesAmount: toNumber(data.sales.totalSalesAmount),
          deliveredSalesAmount: toNumber(data.sales.deliveredSalesAmount),
          refundedSalesAmount: toNumber(data.sales.refundedSalesAmount),
        }
      : null,
    warehouses: data.warehouses
      ? {
          total: toCount(data.warehouses.total),
          active: toCount(data.warehouses.active),
          inactive: toCount(data.warehouses.inactive),
        }
      : null,
    verification: data.verification
      ? {
          kycStatus: toText(data.verification.kycStatus),
          bankStatus: toText(data.verification.bankStatus),
        }
      : null,
    generatedAt: toText(data.generatedAt),
  };
}

/**
 * GET /api/v1/sellers/dashboard
 *
 * Returns server-calculated seller KPIs. This service only normalizes wire
 * values; every sales, order, inventory and warehouse total comes from the
 * backend.
 */
export async function getSellerDashboard(
  signal?: AbortSignal,
): Promise<ApiResult<SellerDashboardResponse>> {
  const res = await apiRequest<
    Envelope<SellerDashboardResponse> | SellerDashboardResponse
  >("/api/v1/sellers/dashboard", { method: "GET", signal });

  if (!res.ok) return res;

  const dashboard = normaliseDashboard(
    unwrap<SellerDashboardResponse | null>(res.data, null),
  );

  if (!dashboard) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid dashboard response.",
    };
  }

  return { ok: true, status: res.status, data: dashboard };
}

export type { ApiResult };
