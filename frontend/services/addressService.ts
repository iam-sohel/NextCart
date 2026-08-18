/**
 * NEXTCART — Address service boundary.
 *
 * Wraps Spring Boot's address module. The backend's `AddressServiceImpl`
 * automatically:
 *   - sets the FIRST address as default when the user has none,
 *   - clears the previous default when a new one is created or marked
 *     as default,
 *   - reassigns a new default on DELETE if the deleted row was default.
 *
 * That last behavior means our store simply trusts the server's response
 * after every mutation — no client-side default bookkeeping needed.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — must match the backend DTOs exactly
   ───────────────────────────────────────────────────────────────────── */

export interface AddressResponseDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequestPayload {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

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
  list: "/api/v1/addresses",
  add: "/api/v1/addresses",
  byId: (id: number) => `/api/v1/addresses/${id}`,
  update: (id: number) => `/api/v1/addresses/${id}`,
  remove: (id: number) => `/api/v1/addresses/${id}`,
  setDefault: (id: number) => `/api/v1/addresses/${id}/default`,
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────────── */

/** GET /api/v1/addresses — full list (sorted default-first by the backend). */
export async function listAddresses(
  signal?: AbortSignal,
): Promise<ApiResult<AddressResponseDTO[]>> {
  const res = await apiRequest<Envelope<AddressResponseDTO[]> | AddressResponseDTO[]>(
    ENDPOINTS.list,
    { method: "GET", signal },
  );
  if (!res.ok) return res;
  const data = unwrap<AddressResponseDTO[]>(res.data, []);
  return { ok: true, status: res.status, data: Array.isArray(data) ? data : [] };
}

/** POST /api/v1/addresses — create. */
export async function createAddress(
  payload: AddressRequestPayload,
  signal?: AbortSignal,
): Promise<ApiResult<AddressResponseDTO>> {
  const res = await apiRequest<Envelope<AddressResponseDTO>>(
    ENDPOINTS.add,
    { method: "POST", body: payload, signal },
  );
  if (!res.ok) return res;
  const dto = unwrap<AddressResponseDTO | null>(res.data, null);
  if (!dto) {
    return {
      ok: false,
      status: res.status,
      message: "Empty response from server.",
    };
  }
  return { ok: true, status: res.status, data: dto };
}

/** GET /api/v1/addresses/{id}. */
export async function getAddress(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<AddressResponseDTO>> {
  const res = await apiRequest<Envelope<AddressResponseDTO>>(
    ENDPOINTS.byId(id),
    { method: "GET", signal },
  );
  if (!res.ok) return res;
  const dto = unwrap<AddressResponseDTO | null>(res.data, null);
  if (!dto) {
    return {
      ok: false,
      status: res.status,
      message: "Empty response from server.",
    };
  }
  return { ok: true, status: res.status, data: dto };
}

/** PUT /api/v1/addresses/{id} — update. */
export async function updateAddress(
  id: number,
  payload: AddressRequestPayload,
  signal?: AbortSignal,
): Promise<ApiResult<AddressResponseDTO>> {
  const res = await apiRequest<Envelope<AddressResponseDTO>>(
    ENDPOINTS.update(id),
    { method: "PUT", body: payload, signal },
  );
  if (!res.ok) return res;
  const dto = unwrap<AddressResponseDTO | null>(res.data, null);
  if (!dto) {
    return {
      ok: false,
      status: res.status,
      message: "Empty response from server.",
    };
  }
  return { ok: true, status: res.status, data: dto };
}

/** DELETE /api/v1/addresses/{id}. */
export async function deleteAddress(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<Envelope<string>>(ENDPOINTS.remove(id), {
    method: "DELETE",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: true };
}

/** PATCH /api/v1/addresses/{id}/default — explicit default-set. */
export async function setDefaultAddress(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<AddressResponseDTO>> {
  const res = await apiRequest<Envelope<AddressResponseDTO>>(
    ENDPOINTS.setDefault(id),
    { method: "PATCH", signal },
  );
  if (!res.ok) return res;
  const dto = unwrap<AddressResponseDTO | null>(res.data, null);
  if (!dto) {
    return {
      ok: false,
      status: res.status,
      message: "Empty response from server.",
    };
  }
  return { ok: true, status: res.status, data: dto };
}

export type { ApiResult };
