/**
 * NEXTCART — Admin seller service boundary.
 *
 * Uses only the existing admin seller endpoints:
 *   GET /api/v1/admin/sellers
 *   GET /api/v1/admin/sellers/{sellerId}
 *   PUT /api/v1/admin/sellers/{sellerId}/activate
 *   PUT /api/v1/admin/sellers/{sellerId}/deactivate
 *
 * Pagination uses only standard Spring `page` and `size` parameters. The
 * backend supplies its default ordering. There is no admin seller search or
 * filter endpoint, so this service does not invent one.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface AdminSeller {
  sellerId: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  gstNumber: string | null;
  verified: boolean;
  active: boolean;
}

export interface AdminSellerPage {
  content: AdminSeller[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminSellerPageQuery {
  page?: number;
  size?: number;
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

function toCount(value: unknown): number | null {
  const amount =
    typeof value === "number" ? value : Number(value as number | string);
  if (!Number.isInteger(amount) || amount < 0) return null;
  return amount;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text : null;
}

function normaliseSeller(seller: AdminSeller): AdminSeller | null {
  if (
    !seller ||
    typeof seller !== "object" ||
    !Number.isInteger(seller.sellerId) ||
    seller.sellerId <= 0 ||
    !Number.isInteger(seller.userId) ||
    seller.userId <= 0 ||
    typeof seller.verified !== "boolean" ||
    typeof seller.active !== "boolean"
  ) {
    return null;
  }

  return {
    sellerId: seller.sellerId,
    userId: seller.userId,
    firstName: toText(seller.firstName),
    lastName: toText(seller.lastName),
    email: toText(seller.email),
    phone: toText(seller.phone),
    businessName: toText(seller.businessName),
    gstNumber: toText(seller.gstNumber),
    verified: seller.verified,
    active: seller.active,
  };
}

function normalisePage(page: AdminSellerPage | null): AdminSellerPage | null {
  if (!page || typeof page !== "object" || !Array.isArray(page.content)) {
    return null;
  }

  const content = page.content
    .map(normaliseSeller)
    .filter((seller): seller is AdminSeller => seller !== null);

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

function pageQuery(query: AdminSellerPageQuery = {}): string {
  const params = new URLSearchParams();
  const page = query.page ?? 0;
  const size = query.size ?? 20;

  params.set("page", Number.isInteger(page) && page >= 0 ? String(page) : "0");
  params.set(
    "size",
    Number.isInteger(size) && size > 0 && size <= 100 ? String(size) : "20",
  );

  return params.toString();
}

const ENDPOINTS = {
  list: "/api/v1/admin/sellers",
  byId: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(String(sellerId))}`,
  activate: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(String(sellerId))}/activate`,
  deactivate: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(String(sellerId))}/deactivate`,
} as const;

function validSellerId(sellerId: number): boolean {
  return Number.isInteger(sellerId) && sellerId > 0;
}

/** GET /api/v1/admin/sellers */
export async function listAdminSellers(
  query: AdminSellerPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<AdminSellerPage>> {
  const res = await apiRequest<Envelope<AdminSellerPage> | AdminSellerPage>(
    `${ENDPOINTS.list}?${pageQuery(query)}`,
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<AdminSellerPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid seller list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/admin/sellers/{sellerId} */
export async function getAdminSeller(
  sellerId: number,
  signal?: AbortSignal,
): Promise<ApiResult<AdminSeller>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<Envelope<AdminSeller> | AdminSeller>(
    ENDPOINTS.byId(sellerId),
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const seller = normaliseSeller(
    unwrap<AdminSeller | null>(res.data, null) as AdminSeller,
  );

  if (!seller) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid seller.",
    };
  }

  return { ok: true, status: res.status, data: seller };
}

/** PUT /api/v1/admin/sellers/{sellerId}/activate */
export async function activateAdminSeller(
  sellerId: number,
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.activate(sellerId),
    { method: "PUT", signal },
  );

  if (!res.ok) return res;
  return { ok: true, status: res.status, data: true };
}

/** PUT /api/v1/admin/sellers/{sellerId}/deactivate */
export async function deactivateAdminSeller(
  sellerId: number,
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.deactivate(sellerId),
    { method: "PUT", signal },
  );

  if (!res.ok) return res;
  return { ok: true, status: res.status, data: true };
}

export type { ApiResult };
