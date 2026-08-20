/**
 * NEXTCART — Wishlist service boundary.
 *
 * Talks to Spring Boot's wishlist module. Endpoint paths and envelope
 * shapes are kept in one file so a future backend rename is a one-line
 * change. Unwraps the `{ success, message, data }` envelope returned by
 * the backend so callers receive the bare payload (an array or a single
 * WishlistResponseDTO).
 *
 * All calls rely on the live JWT injected by `lib/api.ts`; the auth
 * interceptor redirects on 401, and individual call sites should gate
 * mutations on `useAuthStore.getState().token !== null` for the
 * "login required" UX (see WishlistButton / ProductCard).
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — must match the backend DTO exactly
   ───────────────────────────────────────────────────────────────────── */

export interface WishlistResponseDTO {
  wishlistId: number;
  productId: number;
  productName: string;
  productDescription?: string;
  price?: number;
  imageUrl?: string | null;
  /** ISO date string from the server. */
  addedAt: string;
}

/** Backend envelope wrapper. */
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

/* ─────────────────────────────────────────────────────────────────────
   Endpoint helpers
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  list: "/api/v1/wishlist",
  add: (productId: number | string) =>
    `/api/v1/wishlist/add/${encodeURIComponent(String(productId))}`,
  remove: (productId: number | string) =>
    `/api/v1/wishlist/remove/${encodeURIComponent(String(productId))}`,
  clear: "/api/v1/wishlist/clear",
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────────── */

/** GET /api/v1/wishlist — full list. */
export async function listWishlist(
  signal?: AbortSignal,
): Promise<ApiResult<WishlistResponseDTO[]>> {
  const res = await apiRequest<Envelope<WishlistResponseDTO[]> | WishlistResponseDTO[]>(
    ENDPOINTS.list,
    { method: "GET", signal },
  );
  if (!res.ok) return res;
  const data = unwrap<WishlistResponseDTO[]>(res.data, []);
  return { ok: true, status: res.status, data: Array.isArray(data) ? data : [] };
}

/** POST /api/v1/wishlist/add/{productId}. */
export async function addToWishlist(
  productId: number | string,
  signal?: AbortSignal,
): Promise<ApiResult<WishlistResponseDTO>> {
  const res = await apiRequest<Envelope<WishlistResponseDTO>>(
    ENDPOINTS.add(productId),
    { method: "POST", signal },
  );
  if (!res.ok) return res;
  const dto = unwrap<WishlistResponseDTO | null>(res.data, null);
  if (!dto) {
    return {
      ok: false,
      status: res.status,
      message: "Empty response from server.",
    };
  }
  return { ok: true, status: res.status, data: dto };
}

/** DELETE /api/v1/wishlist/remove/{productId}. */
export async function removeFromWishlist(
  productId: number | string,
  signal?: AbortSignal,
): Promise<ApiResult<null>> {
  const res = await apiRequest<Envelope<null>>(ENDPOINTS.remove(productId), {
    method: "DELETE",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: null };
}

/** DELETE /api/v1/wishlist/clear. */
export async function clearWishlist(
  signal?: AbortSignal,
): Promise<ApiResult<null>> {
  const res = await apiRequest<Envelope<null>>(ENDPOINTS.clear, {
    method: "DELETE",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: null };
}

export type { ApiResult };
