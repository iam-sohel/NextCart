/**
 * NEXTCART — Admin seller-verification service boundary.
 *
 * Uses only the existing seller-verification endpoints:
 *   GET /api/v1/admin/sellers/verification
 *   GET /api/v1/admin/sellers/verification/pending
 *   GET /api/v1/admin/sellers/verification/{sellerId}
 *   PUT /api/v1/admin/sellers/verification/{sellerId}/approve
 *   PUT /api/v1/admin/sellers/verification/{sellerId}/reject
 *
 * This workflow is separate from direct seller-KYC approval. The backend
 * returns the `SellerVerification` entity, so only the fields needed by the
 * admin UI are mapped; the nested seller association is reduced to its ID
 * and is never retained or rendered.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type SellerVerificationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED";

export type VerificationCheckStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "REVIEW";

export interface SellerVerification {
  id: number | null;
  sellerId: number | null;
  overallStatus: SellerVerificationStatus | null;
  emailStatus: VerificationCheckStatus | null;
  emailResult: string | null;
  mobileStatus: VerificationCheckStatus | null;
  mobileResult: string | null;
  panStatus: VerificationCheckStatus | null;
  panResult: string | null;
  gstinStatus: VerificationCheckStatus | null;
  gstinResult: string | null;
  startedAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;
  rejectionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SellerVerificationPage {
  content: SellerVerification[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface SellerVerificationPageQuery {
  page?: number;
  size?: number;
}

export interface RejectSellerVerificationRequest {
  reason: string;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const SELLER_VERIFICATION_STATUSES: SellerVerificationStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
  "REVIEW",
  "APPROVED",
  "REJECTED",
];

const VERIFICATION_CHECK_STATUSES: VerificationCheckStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
  "REVIEW",
];

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

function toSellerVerificationStatus(
  value: unknown,
): SellerVerificationStatus | null {
  return typeof value === "string" &&
    (SELLER_VERIFICATION_STATUSES as string[]).includes(value)
    ? (value as SellerVerificationStatus)
    : null;
}

function toVerificationCheckStatus(
  value: unknown,
): VerificationCheckStatus | null {
  return typeof value === "string" &&
    (VERIFICATION_CHECK_STATUSES as string[]).includes(value)
    ? (value as VerificationCheckStatus)
    : null;
}

function normaliseVerification(
  verification: SellerVerification & { seller?: { id?: unknown } | null },
): SellerVerification | null {
  if (!verification || typeof verification !== "object") return null;

  const sellerId = toCount(verification.seller?.id);

  return {
    id: toCount(verification.id),
    sellerId,
    overallStatus: toSellerVerificationStatus(verification.overallStatus),
    emailStatus: toVerificationCheckStatus(verification.emailStatus),
    emailResult: toText(verification.emailResult),
    mobileStatus: toVerificationCheckStatus(verification.mobileStatus),
    mobileResult: toText(verification.mobileResult),
    panStatus: toVerificationCheckStatus(verification.panStatus),
    panResult: toText(verification.panResult),
    gstinStatus: toVerificationCheckStatus(verification.gstinStatus),
    gstinResult: toText(verification.gstinResult),
    startedAt: toText(verification.startedAt),
    completedAt: toText(verification.completedAt),
    reviewedAt: toText(verification.reviewedAt),
    reviewedBy: toCount(verification.reviewedBy),
    rejectionReason: toText(verification.rejectionReason),
    createdAt: toText(verification.createdAt),
    updatedAt: toText(verification.updatedAt),
  };
}

function normalisePage(
  page: SellerVerificationPage | null,
): SellerVerificationPage | null {
  if (!page || typeof page !== "object" || !Array.isArray(page.content)) {
    return null;
  }

  const content = page.content
    .map((verification) =>
      normaliseVerification(
        verification as SellerVerification & {
          seller?: { id?: unknown } | null;
        },
      ),
    )
    .filter(
      (verification): verification is SellerVerification =>
        verification !== null,
    );

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

function pageQuery(query: SellerVerificationPageQuery = {}): string {
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
  list: "/api/v1/admin/sellers/verification",
  pending: "/api/v1/admin/sellers/verification/pending",
  bySellerId: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(String(sellerId))}`,
  approve: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(String(sellerId))}/approve`,
  reject: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(String(sellerId))}/reject`,
} as const;

function validSellerId(sellerId: number): boolean {
  return Number.isInteger(sellerId) && sellerId > 0;
}

/** GET /api/v1/admin/sellers/verification */
export async function listSellerVerifications(
  query: SellerVerificationPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerVerificationPage>> {
  const res = await apiRequest<
    Envelope<SellerVerificationPage> | SellerVerificationPage
  >(`${ENDPOINTS.list}?${pageQuery(query)}`, { method: "GET", signal });

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerVerificationPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid verification list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/admin/sellers/verification/pending */
export async function listPendingSellerVerifications(
  query: SellerVerificationPageQuery = {},
  signal?: AbortSignal,
): Promise<ApiResult<SellerVerificationPage>> {
  const res = await apiRequest<
    Envelope<SellerVerificationPage> | SellerVerificationPage
  >(`${ENDPOINTS.pending}?${pageQuery(query)}`, { method: "GET", signal });

  if (!res.ok) return res;

  const page = normalisePage(
    unwrap<SellerVerificationPage | null>(res.data, null),
  );

  if (!page) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid verification list.",
    };
  }

  return { ok: true, status: res.status, data: page };
}

/** GET /api/v1/admin/sellers/verification/{sellerId} */
export async function getSellerVerification(
  sellerId: number,
  signal?: AbortSignal,
): Promise<ApiResult<SellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerVerification> | SellerVerification>(
    ENDPOINTS.bySellerId(sellerId),
    { method: "GET", signal },
  );

  if (!res.ok) return res;

  const verification = normaliseVerification(
    unwrap<SellerVerification | null>(res.data, null) as SellerVerification & {
      seller?: { id?: unknown } | null;
    },
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid verification record.",
    };
  }

  return { ok: true, status: res.status, data: verification };
}

/** PUT /api/v1/admin/sellers/verification/{sellerId}/approve */
export async function approveSellerVerification(
  sellerId: number,
  signal?: AbortSignal,
): Promise<ApiResult<SellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerVerification> | SellerVerification>(
    ENDPOINTS.approve(sellerId),
    { method: "PUT", signal },
  );

  if (!res.ok) return res;

  const verification = normaliseVerification(
    unwrap<SellerVerification | null>(res.data, null) as SellerVerification & {
      seller?: { id?: unknown } | null;
    },
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid verification record.",
    };
  }

  return { ok: true, status: res.status, data: verification };
}

/** PUT /api/v1/admin/sellers/verification/{sellerId}/reject */
export async function rejectSellerVerification(
  sellerId: number,
  payload: RejectSellerVerificationRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<Envelope<SellerVerification> | SellerVerification>(
    ENDPOINTS.reject(sellerId),
    { method: "PUT", body: payload, signal },
  );

  if (!res.ok) return res;

  const verification = normaliseVerification(
    unwrap<SellerVerification | null>(res.data, null) as SellerVerification & {
      seller?: { id?: unknown } | null;
    },
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid verification record.",
    };
  }

  return { ok: true, status: res.status, data: verification };
}

export type { ApiResult };
