/**
 * NEXTCART — Seller service boundary.
 *
 * Wraps the authenticated seller endpoints exposed by the Spring Boot backend.
 * The backend resolves the seller from the authenticated JWT user, so the
 * frontend NEVER sends a sellerId.
 *
 * Backend endpoints:
 *   GET    /api/v1/sellers/me
 *   PUT    /api/v1/sellers/me
 *   DELETE /api/v1/sellers/me   (deactivates the seller account)
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — must match backend DTOs
   ───────────────────────────────────────────────────────────────────── */

export interface SellerResponse {
  sellerId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  verified: boolean;
  active: boolean;
}

export interface SellerUpdateRequest {
  businessName: string;
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

/* ─────────────────────────────────────────────────────────────────────
   Endpoint helpers
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  me: "/api/v1/sellers/me",
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Seller profile
   ───────────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/sellers/me
 *
 * Returns the currently authenticated seller's profile.
 */
export async function getMySellerProfile(
  signal?: AbortSignal,
): Promise<ApiResult<SellerResponse>> {
  const res = await apiRequest<Envelope<SellerResponse> | SellerResponse>(
    ENDPOINTS.me,
    {
      method: "GET",
      signal,
    },
  );

  if (!res.ok) return res;

  const seller = unwrap<SellerResponse | null>(res.data, null);

  if (!seller) {
    return {
      ok: false,
      status: res.status,
      message: "Empty seller profile response from server.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: seller,
  };
}

/**
 * PUT /api/v1/sellers/me
 *
 * Updates the currently authenticated seller's profile. The backend accepts
 * exactly one editable field: `businessName`.
 */
export async function updateMySellerProfile(
  payload: SellerUpdateRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerResponse>> {
  const res = await apiRequest<Envelope<SellerResponse> | SellerResponse>(
    ENDPOINTS.me,
    {
      method: "PUT",
      body: payload,
      signal,
    },
  );

  if (!res.ok) return res;

  const seller = unwrap<SellerResponse | null>(res.data, null);

  if (!seller) {
    return {
      ok: false,
      status: res.status,
      message: "Empty seller profile response from server.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: seller,
  };
}

/**
 * DELETE /api/v1/sellers/me
 *
 * Deactivates the currently authenticated seller's account. This does NOT
 * physically delete the seller.
 */
export async function deactivateMySellerAccount(
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<void | Envelope<unknown>>(ENDPOINTS.me, {
    method: "DELETE",
    signal,
  });

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}

export type { ApiResult };
