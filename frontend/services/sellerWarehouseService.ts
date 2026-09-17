/**
 * NEXTCART — Seller warehouse service boundary.
 *
 * Wraps the authenticated seller warehouse endpoints. The backend resolves
 * the seller from the JWT, so no sellerId is ever sent.
 *
 * Backend endpoints:
 *   GET   /api/v1/sellers/warehouses
 *   POST  /api/v1/sellers/warehouses
 *   GET   /api/v1/sellers/warehouses/{warehouseId}
 *   PUT   /api/v1/sellers/warehouses/{warehouseId}
 *   PATCH /api/v1/sellers/warehouses/{warehouseId}/deactivate
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface WarehouseResponse {
  id: number;
  sellerId: number;
  warehouseName: string;
  contactPerson: string;
  phoneNumber: string;
  streetAddress: string;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: WarehouseStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WarehouseCreateRequest {
  warehouseName: string;
  contactPerson: string;
  phoneNumber: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface WarehouseUpdateRequest {
  warehouseName?: string;
  contactPerson?: string;
  phoneNumber?: string;
  streetAddress?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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

const ENDPOINTS = {
  list: "/api/v1/sellers/warehouses",
  byId: (id: number) => `/api/v1/sellers/warehouses/${id}`,
  deactivate: (id: number) =>
    `/api/v1/sellers/warehouses/${id}/deactivate`,
} as const;

/** GET /api/v1/sellers/warehouses */
export async function listWarehouses(
  signal?: AbortSignal,
): Promise<ApiResult<WarehouseResponse[]>> {
  const res = await apiRequest<unknown>(ENDPOINTS.list, {
    method: "GET",
    signal,
  });
  if (!res.ok) return res;

  const data = unwrap<WarehouseResponse[] | null>(res.data, null);
  return {
    ok: true,
    status: res.status,
    data: Array.isArray(data) ? data : [],
  };
}

/** GET /api/v1/sellers/warehouses/{id} */
export async function getWarehouse(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<WarehouseResponse>> {
  const res = await apiRequest<
    Envelope<WarehouseResponse> | WarehouseResponse
  >(ENDPOINTS.byId(id), { method: "GET", signal });
  if (!res.ok) return res;

  const data = unwrap<WarehouseResponse | null>(res.data, null);
  if (!data) {
    return { ok: false, status: res.status, message: "Empty warehouse response." };
  }
  return { ok: true, status: res.status, data };
}

/** POST /api/v1/sellers/warehouses */
export async function createWarehouse(
  payload: WarehouseCreateRequest,
  signal?: AbortSignal,
): Promise<ApiResult<WarehouseResponse>> {
  const res = await apiRequest<
    Envelope<WarehouseResponse> | WarehouseResponse
  >(ENDPOINTS.list, { method: "POST", body: payload, signal });
  if (!res.ok) return res;

  const data = unwrap<WarehouseResponse | null>(res.data, null);
  if (!data) {
    return { ok: false, status: res.status, message: "Empty warehouse response." };
  }
  return { ok: true, status: res.status, data };
}

/** PUT /api/v1/sellers/warehouses/{id} */
export async function updateWarehouse(
  id: number,
  payload: WarehouseUpdateRequest,
  signal?: AbortSignal,
): Promise<ApiResult<WarehouseResponse>> {
  const res = await apiRequest<
    Envelope<WarehouseResponse> | WarehouseResponse
  >(ENDPOINTS.byId(id), { method: "PUT", body: payload, signal });
  if (!res.ok) return res;

  const data = unwrap<WarehouseResponse | null>(res.data, null);
  if (!data) {
    return { ok: false, status: res.status, message: "Empty warehouse response." };
  }
  return { ok: true, status: res.status, data };
}

/** PATCH /api/v1/sellers/warehouses/{id}/deactivate */
export async function deactivateWarehouse(
  id: number,
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.deactivate(id),
    { method: "PATCH", signal },
  );
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: true };
}

export type { ApiResult };
